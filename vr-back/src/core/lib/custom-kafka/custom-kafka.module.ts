// in your app.module.ts for example
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { CustomKafkaClient } from "./custom-kafka-client";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "MY_CUSTOM_SERVICE",
        customClass: CustomKafkaClient,
        options: {
          client: {
            // Options for your alternative kafka library
            brokers: ["localhost:9092"],
          },
        },
      },
    ]),
  ],
  // ...
})
export class AppModule {}

import { NestFactory } from "@nestjs/core";
import { CustomKafkaServer } from "./custom-kafka-server";

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new CustomKafkaServer({
      client: {
        // Options for your alternative kafka library
        brokers: ["localhost:9092"],
      },
    }),
  });
  await app.listen();
}
// bootstrap();
