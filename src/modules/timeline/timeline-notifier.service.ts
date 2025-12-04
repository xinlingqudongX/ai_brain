import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CronJob } from 'cron';
import { TimelineNotifierEntity } from '../../entities/timeline-notifier.entity';
import { AgentEntity } from '../../entities/agent.entity';
import {
  CreateTimelineNotifierDto,
  UpdateTimelineNotifierDto,
  ListTimelineNotifiersDto,
} from './dto/timeline-notifier.dto';

@Injectable()
export class TimelineNotifierService implements OnModuleInit {
  private readonly logger = new Logger(TimelineNotifierService.name);

  constructor(
    @InjectRepository(TimelineNotifierEntity)
    private notifierRepository: Repository<TimelineNotifierEntity>,
    @InjectRepository(AgentEntity)
    private agentRepository: Repository<AgentEntity>,
    private schedulerRegistry: SchedulerRegistry,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // 启动时加载所有启用的通知器
    await this.loadAllNotifiers();
  }

  async create(
    createDto: CreateTimelineNotifierDto,
  ): Promise<TimelineNotifierEntity> {
    const existing = await this.notifierRepository.findOne({
      where: { eventName: createDto.eventName },
    });

    if (existing) {
      throw new ConflictException('Event name already exists');
    }

    const notifier = this.notifierRepository.create(createDto);
    const saved = await this.notifierRepository.save(notifier);

    if (saved.isEnabled) {
      this.registerCronJob(saved);
    }

    return saved;
  }

  async findAll(query: ListTimelineNotifiersDto) {
    const { page, limit, search, isEnabled } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.eventName = Like(`%${search}%`);
    }
    if (isEnabled !== undefined) {
      where.isEnabled = isEnabled;
    }

    const [items, total] = await this.notifierRepository.findAndCount({
      where,
      skip,
      take: limit,
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

  async findOne(id: string): Promise<TimelineNotifierEntity> {
    const notifier = await this.notifierRepository.findOne({
      where: { id },
    });

    if (!notifier) {
      throw new NotFoundException('Timeline notifier not found');
    }

    return notifier;
  }

  async update(
    id: string,
    updateDto: UpdateTimelineNotifierDto,
  ): Promise<TimelineNotifierEntity> {
    const notifier = await this.findOne(id);

    if (updateDto.eventName && updateDto.eventName !== notifier.eventName) {
      const existing = await this.notifierRepository.findOne({
        where: { eventName: updateDto.eventName },
      });
      if (existing) {
        throw new ConflictException('Event name already exists');
      }
    }

    // 如果修改了 cron 表达式或启用状态，需要重新注册
    const needReregister =
      (updateDto.cronExpression &&
        updateDto.cronExpression !== notifier.cronExpression) ||
      (updateDto.isEnabled !== undefined &&
        updateDto.isEnabled !== notifier.isEnabled);

    Object.assign(notifier, updateDto);
    const updated = await this.notifierRepository.save(notifier);

    if (needReregister) {
      this.unregisterCronJob(id);
      if (updated.isEnabled) {
        this.registerCronJob(updated);
      }
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const notifier = await this.findOne(id);
    this.unregisterCronJob(id);
    await this.notifierRepository.remove(notifier);
  }

  async triggerEvent(id: string): Promise<void> {
    const notifier = await this.findOne(id);
    await this.broadcastEvent(notifier);
  }

  private async loadAllNotifiers(): Promise<void> {
    const notifiers = await this.notifierRepository.find({
      where: { isEnabled: true },
    });

    for (const notifier of notifiers) {
      this.registerCronJob(notifier);
    }

    this.logger.log(`Loaded ${notifiers.length} timeline notifiers`);
  }

  private registerCronJob(notifier: TimelineNotifierEntity): void {
    try {
      const callback = async () => {
        await this.broadcastEvent(notifier);
      };

      const job = new CronJob(
        notifier.cronExpression,
        callback,
        null,
        false,
        'Asia/Shanghai',
      );

      this.schedulerRegistry.addCronJob(`notifier-${notifier.id}`, job as any);
      job.start();

      this.logger.log(
        `Registered cron job for notifier: ${notifier.eventName} (${notifier.cronExpression})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to register cron job for notifier ${notifier.eventName}: ${error.message}`,
      );
    }
  }

  private unregisterCronJob(id: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(`notifier-${id}`);
      if (job) {
        job.stop();
        this.schedulerRegistry.deleteCronJob(`notifier-${id}`);
        this.logger.log(`Unregistered cron job for notifier: ${id}`);
      }
    } catch (error) {
      // Job 不存在，忽略
    }
  }

  private async broadcastEvent(
    notifier: TimelineNotifierEntity,
  ): Promise<void> {
    this.logger.log(`Broadcasting event: ${notifier.eventName}`);

    // 更新执行信息
    notifier.lastExecutedAt = new Date();
    notifier.executionCount += 1;
    await this.notifierRepository.save(notifier);

    // 查找订阅了此事件的所有 Agent
    const agents = await this.agentRepository
      .createQueryBuilder('agent')
      .where(':eventName = ANY(agent.subscribedEvents)', {
        eventName: notifier.eventName,
      })
      .andWhere('agent.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('agent.roles', 'roles')
      .leftJoinAndSelect('roles.capabilities', 'capabilities')
      .getMany();

    this.logger.log(
      `Found ${agents.length} agents subscribed to event: ${notifier.eventName}`,
    );

    // 广播事件给所有订阅的 Agent
    for (const agent of agents) {
      this.eventEmitter.emit('timeline.event', {
        eventName: notifier.eventName,
        agent: agent,
        context: notifier.context,
        timestamp: new Date(),
      });

      this.logger.log(
        `Notified agent: ${agent.name} for event: ${notifier.eventName}`,
      );
    }
  }
}
