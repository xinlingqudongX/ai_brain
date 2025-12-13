import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { getCorsConfig } from './config/cors.config';
const PackageJson = require('../package.json');

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // 配置CORS
  const corsConfig = getCorsConfig();
  await app.register(require('@fastify/cors'), corsConfig);

  // 配置静态文件服务
  app.useStaticAssets({
    root: join(__dirname, '..', 'src', 'static'),
    prefix: '/',
  });

  const configService = app.get(ConfigService);
  const port =
    configService.get<number>('app.port') || process.env.PORT || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || '/api/v1';

  app.setGlobalPrefix(apiPrefix);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('AI Brain API')
    .setDescription('AI 智能聊天系统 API 文档')
    .setVersion('2.0')
    .addTag('聊天管理', '管理聊天会话和消息')
    .addTag('角色管理', '管理 AI 角色及其关联的能力')
    .addTag('能力管理', '管理 AI 能力')
    .addTag('Agent管理', '管理 Agent 综合解决方案')
    .addTag('时间线管理', '管理定时和周期性事件通知')
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
