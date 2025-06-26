import {
  /**
   CustomTransportStrategy,
   Transport,
   Serializer,
   */
  Server,
  ReadPacket,
  WritePacket,
  Deserializer,
  IncomingRequest,
  IncomingEvent,
  ConsumerSerializer,
  ConsumerDeserializer,
} from "@nestjs/microservices";
import * as K from "@platformatic/kafka";
import { lastValueFrom } from "rxjs";
import { EventEmitter } from "events";
import * as hwp from "hwp";
import { stringDeserializers } from "@platformatic/kafka";

// These would be your standard header names
export const PLATFORMATIC_KAFKA_HEADERS = {
  CORRELATION_ID: "correlation_id",
  REPLY_TOPIC: "reply_to",
  ERROR: "err",
  IS_DISPOSED: "is_disposed",
};

/**
 * Serializer for outgoing messages. Formats NestJS WritePacket into
 * a message object that the @platformatic/kafka producer can send.
 */
// export class PlatformaticKafkaRequestSerializer implements Serializer<WritePacket, any> {
//   serialize(packet: WritePacket): any {
//     const { id, response, err, isDisposed } = packet;
//
//     const value = response ?? err ?? {};
//
//     // The final message object to be sent by the producer
//     const message = {
//       // The value should be a buffer or string
//       value: Buffer.from(JSON.stringify(value)),
//       headers: {
//         [PLATFORMATIC_KAFKA_HEADERS.CORRELATION_ID]: Buffer.from(id || randomUUID()),
//       },
//     };
//
//     if (err) {
//       message.headers[PLATFORMATIC_KAFKA_HEADERS.ERROR] = Buffer.from(
//         JSON.stringify(err),
//       );
//     }
//     if (isDisposed) {
//       message.headers[PLATFORMATIC_KAFKA_HEADERS.IS_DISPOSED] = Buffer.from("true");
//     }
//
//     return message;
//   }
// }

/**
 * Deserializer for incoming messages. Parses a raw message from the
 * @platformatic/kafka consumer into a NestJS ReadPacket.
 */
export class PlatformaticKafkaRequestDeserializer
  implements Deserializer<any, IncomingRequest | IncomingEvent>
{
  deserialize(
    message: K.Message<string, string, string, string>,
    // options?: Record<string, any>,
  ): ReadPacket {
    // message is the raw message from @platformatic/kafka consumer
    // options.channel would be the topic
    const { value } = message;

    // const hObject = JSON.parse(headers);
    // const id: string | undefined =
    //   hObject?.[PLATFORMATIC_KAFKA_HEADERS.CORRELATION_ID]?.toString();

    // const pattern = options?.channel;

    // The data for the handler is the parsed message value
    const data: unknown = JSON.parse(value);

    if (data !== Object(data)) {
      throw new TypeError("Value is not JSON");
    }

    // The final packet that NestJS handlers will receive
    return {
      pattern: "topic",
      data,
      // id, // Attach the ID for request-response correlation
    };
  }
}

export interface PlatformaticKafkaServerOptions {
  // Options specifically for the @platformatic/kafka consumer
  consumer: K.ConsumerOptions<string, string, string, string>;

  // Options specifically for the @platformatic/kafka producer
  // producer: K.ProducerOptions<
  //   Buffer<ArrayBufferLike>,
  //   Buffer<ArrayBufferLike>,
  //   Buffer<ArrayBufferLike>,
  //   Buffer<ArrayBufferLike>
  // >;

  // Standard NestJS serializer/deserializer properties
  // These will be picked up by the initializeSerializer methods.
  serializer?: ConsumerSerializer;
  deserializer?: ConsumerDeserializer;
}

// Define custom status strings for clarity
type KafkaServerStatus = "CONNECTED" | "DISCONNECTED" | "CONNECTING";

type EventsMap = Record<"foo" | "bar", (...args: any[]) => void>;

export class CustomKafkaServer extends Server<EventsMap> {
  // The underlying client instance from your chosen library
  public consumer: K.Consumer<string, string, string, string>;

  // An event emitter to satisfy the abstract `on` method
  private readonly emitter = new EventEmitter();

  constructor(private readonly options: PlatformaticKafkaServerOptions) {
    // Call the parent constructor
    super();

    // Instantiate the underlying client for your library
    this.consumer = new K.Consumer<string, string, string, string>({
      ...this.options.consumer,
      deserializers: stringDeserializers,
    });

    // Use the initializeSerializer/Deserializer methods provided by the base Server class
    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  // protected initializeSerializer(options: PlatformaticKafkaServerOptions) {
  //  this.serializer = options.serializer || new PlatformaticKafkaRequestSerializer();
  // }

  protected initializeDeserializer(options: PlatformaticKafkaServerOptions) {
    this.deserializer =
      options.deserializer ?? new PlatformaticKafkaRequestDeserializer();
  }

  /**
   * The core method to start the server. It connects to the Kafka client,
   * subscribes to topics, and starts listening for messages.
   */
  public async listen(cb: () => void): Promise<void> {
    try {
      // Use the protected _status$ subject from the base Server class
      this._status$.next("CONNECTING" as KafkaServerStatus);

      const stream = await this.consumer.consume({
        autocommit: true,
        topics: ["my-topic"],
        sessionTimeout: 10000,
        heartbeatInterval: 500,
      });

      this._status$.next("CONNECTED" as KafkaServerStatus);

      // Define how to handle incoming messages
      const messageHandler = async (
        message: K.Message<string, string, string, string>,
      ) => {
        try {
          const packet = await this.deserializer.deserialize(message);

          // handleMessage is inherited and finds the correct @MessagePattern
          await this.handleMessage(packet);
        } catch (error) {
          // Use the logger from the base Server class
          this.logger.error("Error handling message:", error);
        }
      };

      await hwp.forEach(stream, messageHandler);

      cb(); // Signal to NestJS that the microservice is ready
    } catch (err) {
      this.logger.error("Failed to connect to Kafka", err);
      // Use the protected _status$ subject to broadcast errors
      this._status$.error(err);
      this._status$.next("DISCONNECTED" as KafkaServerStatus);
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
    this._status$.next("DISCONNECTED" as KafkaServerStatus);
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
  public on<T extends "foo" | "bar", F extends (...args: any[]) => void>(
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
  private async handleMessage(
    packet: ReadPacket<Record<string, unknown>>,
  ): Promise<void> {
    const { pattern, data /* id: correlationId */ } = packet;

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
