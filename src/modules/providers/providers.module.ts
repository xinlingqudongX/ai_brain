import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { RedisProvider } from './redis.provider';

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class ProvidersModule {}
