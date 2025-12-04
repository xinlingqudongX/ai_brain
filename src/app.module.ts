import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './modules/roles/roles.module';
import { CapabilitiesModule } from './modules/capabilities/capabilities.module';
import { ProvidersModule } from './modules/providers/providers.module';

const loadYamlConfig = (filename: string): Record<string, any> => {
  const filePath = path.join(process.cwd(), 'config', filename);
  if (fs.existsSync(filePath)) {
    return yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<string, any>;
  }
  return {};
};

const envName = process.env.NODE_ENV || 'development';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          ...loadYamlConfig(`${envName}.yaml`),
        }),
      ],
    }),
    ProvidersModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    RolesModule,
    CapabilitiesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
