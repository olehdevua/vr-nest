import {
  /**
  CustomTransportStrategy,
  Transport,
  */
  Server,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import * as K from '@platformatic/kafka';
import { lastValueFrom } from 'rxjs';
import { EventEmitter } from 'events';
import * as hwp from 'hwp';

// Define custom status strings for clarity
type KafkaServerStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export class CustomKafkaServer extends Server {
  // The underlying client instance from your chosen library
  public consumer: K.Consumer;

  // An event emitter to satisfy the abstract `on` method
  private readonly emitter = new EventEmitter();

  constructor(
    private readonly options: {
      client: K.ConsumerOptions<
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>
      >;
    },
  ) {
    // Call the parent constructor
    super();

    // Instantiate the underlying client for your library
    this.consumer = new K.Consumer(this.options.client);

    // Use the initializeSerializer/Deserializer methods provided by the base Server class
    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  /**
   * The core method to start the server. It connects to the Kafka client,
   * subscribes to topics, and starts listening for messages.
   */
  public async listen(cb: () => void): Promise<void> {
    try {
      // Use the protected _status$ subject from the base Server class
      this._status$.next('CONNECTING' as KafkaServerStatus);

      const stream = await this.consumer.consume({
        autocommit: true,
        topics: ['my-topic'],
        sessionTimeout: 10000,
        heartbeatInterval: 500,
      });

      this._status$.next('CONNECTED' as KafkaServerStatus);

      // Define how to handle incoming messages
      const messageHandler = (message: K.Message) => {
        try {
          // Use the deserializer initialized in the constructor
          const packet = this.deserializer.deserialize(
            JSON.parse(message.value.toString()),
          );

          // handleMessage is inherited and finds the correct @MessagePattern
          return this.handleMessage(packet);
        } catch (error) {
          // Use the logger from the base Server class
          this.logger.error('Error handling message:', error);
        }
      };

      await hwp.forEach(stream, messageHandler);

      cb(); // Signal to NestJS that the microservice is ready
    } catch (err) {
      this.logger.error('Failed to connect to Kafka', err);
      // Use the protected _status$ subject to broadcast errors
      this._status$.error(err);
      this._status$.next('DISCONNECTED' as KafkaServerStatus);
      throw err;
    }
  }

  /**
   * Closes the connection to the message broker.
   */
  public async close(): Promise<void> {
    if (this.consumer) {
      await this.consumer.close();
    }
    this._status$.next('DISCONNECTED' as KafkaServerStatus);
    this._status$.complete();
  }

  /**
   * Returns the underlying Kafka client instance.
   */
  public unwrap<T>(): T {
    return this.consumer as T;
  }

  /**
   * Registers an event listener. We use our private event emitter
   * to satisfy the abstract contract.
   */
  public on<T extends string, F extends (...args: any[]) => void>(
    event: T,
    callback: F,
  ): this {
    this.emitter.on(event, callback);
    return this;
  }

  /**
   * This is a simplified handler for request-response. A real-world scenario
   * requires a robust correlation ID mechanism and a dedicated response topic.
   */
  private async handleMessage(packet: ReadPacket): Promise<void> {
    const { pattern, data, id: correlationId } = packet;

    const handler = this.getHandlerByPattern(pattern);
    if (!handler) {
      // Handle cases where no @MessagePattern matches
      return;
    }

    const response$ = this.transformToObservable(await handler(data));
    const response = await lastValueFrom(response$);

    // For request-response, send the response back
    // This assumes your Kafka library can send to a specific reply-topic or similar
    if (correlationId) {
      const outgoingPacket: WritePacket = { id: correlationId, response };
      // You would need a method on your client to send the response
      // e.g., this.client.sendResponse({ ...outgoingPacket });
    }
  }
}
