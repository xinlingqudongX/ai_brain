import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  TimelineEventEntity,
  EventStatus,
  EventType,
} from '../../entities/timeline-event.entity';
import { AgentEntity } from '../../entities/agent.entity';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventDto,
  ListTimelineEventsDto,
} from './dto/timeline-event.dto';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(TimelineEventEntity)
    private timelineEventRepository: Repository<TimelineEventEntity>,
    @InjectRepository(AgentEntity)
    private agentRepository: Repository<AgentEntity>,
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async create(
    createDto: CreateTimelineEventDto,
  ): Promise<TimelineEventEntity> {
    const agent = await this.agentRepository.findOne({
      where: { id: createDto.agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    const event = this.timelineEventRepository.create(createDto);
    if (createDto.scheduledAt) {
      event.scheduledAt = new Date(createDto.scheduledAt);
    }

    const savedEvent = await this.timelineEventRepository.save(event);

    // 如果是定时事件，注册到调度器
    if (createDto.type === EventType.SCHEDULED && createDto.scheduledAt) {
      this.scheduleEvent(savedEvent);
    } else if (
      createDto.type === EventType.INTERVAL &&
      createDto.intervalSeconds
    ) {
      this.scheduleIntervalEvent(savedEvent);
    }

    return savedEvent;
  }

  async findAll(query: ListTimelineEventsDto) {
    const { agentId, status, type, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (agentId) where.agentId = agentId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await this.timelineEventRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['agent'],
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<TimelineEventEntity> {
    const event = await this.timelineEventRepository.findOne({
      where: { id },
      relations: ['agent'],
    });

    if (!event) {
      throw new NotFoundException('Timeline event not found');
    }

    return event;
  }

  async update(
    id: string,
    updateDto: UpdateTimelineEventDto,
  ): Promise<TimelineEventEntity> {
    const event = await this.findOne(id);

    Object.assign(event, {
      ...updateDto,
      scheduledAt: updateDto.scheduledAt
        ? new Date(updateDto.scheduledAt)
        : event.scheduledAt,
    });

    return await this.timelineEventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);

    // 取消调度
    this.cancelScheduledEvent(id);

    await this.timelineEventRepository.remove(event);
  }

  async executeEvent(eventId: string): Promise<void> {
    const event = await this.findOne(eventId);

    if (event.status === EventStatus.PROCESSING) {
      return; // 已在执行中
    }

    event.status = EventStatus.PROCESSING;
    event.executedAt = new Date();
    await this.timelineEventRepository.save(event);

    try {
      // 触发 Agent 执行
      this.eventEmitter.emit('agent.execute', {
        agent: event.agent,
        context: {
          ...event.context,
          triggeredBy: 'timeline',
          eventId: event.id,
          eventName: event.name,
        },
      });

      event.status = EventStatus.COMPLETED;
      event.completedAt = new Date();
      event.result = { success: true, executedAt: new Date() };
    } catch (error) {
      event.status = EventStatus.FAILED;
      event.error = error.message;
    }

    await this.timelineEventRepository.save(event);
  }

  private scheduleEvent(event: TimelineEventEntity): void {
    if (!event.scheduledAt) return;

    const timeout = setTimeout(async () => {
      await this.executeEvent(event.id);
    }, event.scheduledAt.getTime() - Date.now());

    this.schedulerRegistry.addTimeout(`event-${event.id}`, timeout);
  }

  private scheduleIntervalEvent(event: TimelineEventEntity): void {
    const interval = setInterval(async () => {
      await this.executeEvent(event.id);
    }, event.intervalSeconds * 1000);

    this.schedulerRegistry.addInterval(`event-${event.id}`, interval);
  }

  private cancelScheduledEvent(eventId: string): void {
    try {
      const timeout = this.schedulerRegistry.getTimeout(`event-${eventId}`);
      if (timeout) {
        clearTimeout(timeout);
        this.schedulerRegistry.deleteTimeout(`event-${eventId}`);
      }
    } catch (error) {
      // Timeout 不存在
    }

    try {
      const interval = this.schedulerRegistry.getInterval(`event-${eventId}`);
      if (interval) {
        clearInterval(interval);
        this.schedulerRegistry.deleteInterval(`event-${eventId}`);
      }
    } catch (error) {
      // Interval 不存在
    }
  }

  // 每分钟检查待执行的事件
  @Cron(CronExpression.EVERY_MINUTE)
  async checkPendingEvents(): Promise<void> {
    const now = new Date();
    const pendingEvents = await this.timelineEventRepository.find({
      where: {
        status: EventStatus.PENDING,
        type: EventType.SCHEDULED,
      },
    });

    for (const event of pendingEvents) {
      if (event.scheduledAt && event.scheduledAt <= now) {
        await this.executeEvent(event.id);
      }
    }
  }

  @OnEvent('agent.deleted')
  async handleAgentDeleted(payload: { agentId: string }): Promise<void> {
    // Agent 删除时，取消所有相关的定时事件
    const events = await this.timelineEventRepository.find({
      where: { agentId: payload.agentId },
    });

    for (const event of events) {
      this.cancelScheduledEvent(event.id);
    }
  }
}
