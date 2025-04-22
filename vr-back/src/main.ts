import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

// Error.stackTraceLimit = 30;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // Use the Pino Logger instance provided by the LoggerModule
  app.useLogger(app.get(Logger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
