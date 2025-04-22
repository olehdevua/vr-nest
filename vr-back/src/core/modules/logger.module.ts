import { randomUUID } from 'crypto';
import { LoggerModule, Params as PinoParams } from 'nestjs-pino';
import { VRConfigModule, VRConfigService } from './vr-config.module';

export const loggerModule = LoggerModule.forRootAsync({
  imports: [VRConfigModule],
  inject: [VRConfigService],
  useFactory(configService: VRConfigService) {
    const config = configService.getPinoConfig();

    return <PinoParams>{
      pinoHttp: {
        // Use 'autoLogging: false' if you want to manually log requests/responses
        // autoLogging: false,
        // Generate a request ID automatically (you might have your own middleware)
        genReqId(req, res) {
          return (
            req.headers['x-request-id'] ??
            res.getHeader('X-Request-Id') ??
            randomUUID()
          );
        },
        // Add custom properties to the log, like the request ID under a specific key
        customProps(req /*, res */) {
          return {
            requestId: req.id, // req.id is populated by genReqId
          };
        },
        transport: !config.pretty
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                colorizeObjects: true,
                singleLine: true,
              },
            },
        level: config.level,
      },
    };
  },
});
