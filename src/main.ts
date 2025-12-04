import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
const PackageJson = require('../package.json');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get(ConfigService);
  const port =
    configService.get<number>('app.port') || process.env.PORT || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || '/api/v1';

  app.setGlobalPrefix(apiPrefix);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('AI Brain API')
    .setDescription('AI 角色和能力管理平台 API 文档')
    .setVersion('1.0')
    .addTag('角色管理', '管理 AI 角色及其关联的能力')
    .addTag('能力管理', '管理 AI 能力')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port, '0.0.0.0');
  console.log(
    `Application ${PackageJson.name} is running on: http://localhost:${port}${apiPrefix}`,
  );
  console.log(`Swagger documentation: http://localhost:${port}/api-docs`);
  console.log(`${process.env.NODE_ENV}环境`);
  console.log(`${PackageJson.name} Version：${PackageJson.version}`);
}
void bootstrap();
