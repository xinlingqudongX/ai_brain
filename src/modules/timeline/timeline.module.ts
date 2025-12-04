import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { TimelineEventEntity } from '../../entities/timeline-event.entity';
import { AgentEntity } from '../../entities/agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimelineEventEntity, AgentEntity])],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
