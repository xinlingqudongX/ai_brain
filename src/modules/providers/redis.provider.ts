import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    const redisConfig = {
      host: configService.get('redis.host', 'localhost'),
      port: configService.get('redis.port', 6379),
      password: configService.get('redis.password', ''),
      db: configService.get('redis.db', 0),
      keyPrefix: configService.get('redis.keyPrefix', 'ai_brain:'),
      maxRetriesPerRequest: configService.get('redis.maxRetriesPerRequest', 3),
    };

    const redis = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      keyPrefix: redisConfig.keyPrefix,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    // 错误处理
    redis.on('error', (error: Error) => {
      console.error('Redis连接错误:', error);
    });

    redis.on('connect', () => {
      console.log('Redis连接成功');
    });

    redis.on('ready', () => {
      console.log('Redis准备就绪');
    });

    redis.on('close', () => {
      console.log('Redis连接关闭');
    });

    redis.on('reconnecting', () => {
      console.log('Redis重新连接中...');
    });

    return redis;
  },
  inject: [ConfigService],
};
