import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { Consumer, ConsumerOptions, Message } from '@platformatic/kafka'; // Replace with your actual library

export class CustomKafkaServer extends Server implements CustomTransportStrategy
{
  private readonly client: Consumer;

  constructor(
    private readonly options: { client: ConsumerOptions<any, any, any, any> },
  ) {
    super();
    this.client = new Consumer(this.options.client);
  }

  public async listen(callback: () => void) {
    await this.client.connect();

    // Subscribe to topics or message queues
    await this.client.subscribe({ topic: 'my-topic' }, (message: Message) => {
      // Assuming the message has a pattern and data
      const { pattern, data, id } = JSON.parse(message.value.toString());

      const packet = this.deserializer.deserialize({ pattern, data, id });

      // The handleMessage will find the right @MessagePattern handler
      // and handle request-response or event-based logic.
      this.handleMessage(packet);
    });

    callback();
  }

  public close() {
    this.client.disconnect();
  }
}
