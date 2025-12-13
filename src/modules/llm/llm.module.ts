import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { SessionEntity } from '../../entities/chat_session.entity';
import { ChatMessageEntity } from '../../entities/chat_message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SessionEntity, ChatMessageEntity])
  ],
  providers: [LlmService],
  controllers: [LlmController],
  exports: [LlmService],
})
export class LlmModule {}
