import {
  Server,
  CustomTransportStrategy,
  Transport,
} from '@nestjs/microservices';
import { Status } from '@nestjs/microservices/enums/status.enum';
import { Consumer, ConsumerOptions, Message } from '@platformatic/kafka'; // Replace with your actual library
import { Observable, BehaviorSubject } from 'rxjs';

export class CustomKafkaServer
  extends Server
  implements CustomTransportStrategy
{
  // The underlying client instance from your chosen library
  public client: Consumer;

  // RxJS Subject to manage and emit the server's connection status
  private readonly statusSubject: BehaviorSubject<Status>;

  constructor(
    private readonly options: {
      client: ConsumerOptions<
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>,
        Buffer<ArrayBufferLike>
      >;
    },
  ) {
    super();
    this.client = new Consumer(this.options.client);

    // Initialize the status as DISCONNECTED
    this.statusSubject = new BehaviorSubject<Status>(Status.DISCONNECTED);
  }

  /**
   * Returns an observable that emits the connection status.
   * Required by the abstract Server class.
   */
  public get status(): Observable<Status> {
    return this.statusSubject.asObservable();
  }

  /**
   * Sets the transport identifier. Called internally by NestJS.
   * Required by the abstract Server class.
   */
  public setTransportId(transportId: Transport | symbol): void {
    this.transportId = transportId;
  }

  /**
   * The core method to start the server. It connects to the Kafka client,
   * subscribes to topics, and starts listening for messages.
   * Required by the abstract Server class.
   */
  public async listen(callback: () => void): Promise<void> {
    try {
      this.statusSubject.next(Status.CONNECTING);
      await this.client.connect();
      this.statusSubject.next(Status.CONNECTED);

      // Define how to handle incoming messages from your Kafka client
      const messageHandler = async (message: Message) => {
        try {
          // The 'handleMessage' method is inherited from the base Server class.
          // It finds the correct @MessagePattern or @EventPattern handler.
          const packet = this.deserializer.deserialize(
            JSON.parse(message.value.toString()),
          );
          await this.handleMessage(packet);
        } catch (error) {
          this.logger.error('Error handling message:', error);
        }
      };

      // Subscribe to the relevant topics using your library's method
      await this.client.subscribe({ topic: 'my-topic' }, messageHandler);

      // The callback signals to NestJS that the microservice is ready.
      callback();
    } catch (err) {
      this.logger.error('Failed to connect to Kafka', err);
      this.statusSubject.error(err);
      this.statusSubject.next(Status.DISCONNECTED);
      throw err;
    }
  }

  /**
   * Returns the underlying Kafka client instance.
   * This is useful for accessing the raw client API if needed.
   * Required by the abstract Server class.
   */
  public unwrap<T>(): T {
    return this.client as T;
  }

  /**
   * Registers an event listener. The base `Server` class already has an
   * event emitter, so we just delegate to it.
   * Required by the abstract Server class.
   */
  public on(event: string, callback: (...args: any[]) => void): this {
    this.emitter.on(event, callback);
    return this;
  }

  /**
   * Closes the connection to the message broker.
   * Required by the abstract Server class.
   */
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
    }
    this.statusSubject.next(Status.DISCONNECTED);
    this.statusSubject.complete();
  }
}
