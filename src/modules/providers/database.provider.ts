import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export const databaseProviders = [
  TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      host: configService.get('database.host'),
      port: configService.get('database.port'),
      username: configService.get('database.username'),
      password: configService.get('database.password'),
      database: configService.get('database.database'),
      synchronize: configService.get('database.synchronize'),
      logging: configService.get('database.logging'),
      maxQueryExecutionTime: 1000,
      entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
      // 连接池配置
      extra: {
        max: 20, // 最大连接数
        min: 5, // 最小连接数
        acquire: 30000, // 获取连接的最大等待时间(毫秒)
        idle: 10000, // 连接空闲时间(毫秒)
      },
    }),
    inject: [ConfigService],
  }),
];
