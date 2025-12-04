import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';

@Global()
@Module({
  imports: [...databaseProviders],
  providers: [],
  exports: [...databaseProviders],
})
export class ProvidersModule {}
