import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { HeartbeatEvent } from 'src/common/events/heartbeat.event';

@Injectable()
export class SchedulerService {
  constructor(private eventEmitter: EventEmitter2) {}

  @Cron('*/1 * * * * *')
  public handleHeartbeat() {
    this.eventEmitter.emit('life.heartbeat', new HeartbeatEvent(new Date()));
  }
}
