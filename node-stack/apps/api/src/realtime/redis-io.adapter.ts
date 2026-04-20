import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(configService: ConfigService): Promise<void> {
    const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = configService.get<number>('REDIS_PORT', 6379);
    const redisPassword = configService.get<string>('REDIS_PASSWORD');
    const redisTls = configService.get<boolean>('REDIS_TLS', false);

    const pubClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      tls: redisTls ? {} : undefined,
      lazyConnect: true,
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    
    const redisPrefix = configService.get<string>('REDIS_PREFIX', 'socket.io');

    this.adapterConstructor = createAdapter(pubClient, subClient, {
      key: redisPrefix,
    });
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
