import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineController } from './timeline.controller';
import { TimelineNotifierService } from './timeline-notifier.service';
import { TimelineNotifierEntity } from '../../entities/timeline-notifier.entity';
import { AgentEntity } from '../../entities/agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimelineNotifierEntity, AgentEntity])],
  controllers: [TimelineController],
  providers: [TimelineNotifierService],
  exports: [TimelineNotifierService],
})
export class TimelineModule {}
