import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentEntity } from '../../entities/agent.entity';
import { RoleEntity } from '../../entities/role.entity';
import {
  CreateAgentDto,
  UpdateAgentDto,
  ListAgentsDto,
  ExecuteAgentDto,
} from './dto/agent.dto';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createDto: CreateAgentDto): Promise<AgentEntity> {
    const existing = await this.agentRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Agent with this name already exists');
    }

    const agent = this.agentRepository.create({
      name: createDto.name,
      description: createDto.description,
      goal: createDto.goal,
      config: createDto.config,
    });

    if (createDto.roleIds && createDto.roleIds.length > 0) {
      const roles = await this.roleRepository.findBy({
        id: In(createDto.roleIds),
      });
      agent.roles = roles;
    }

    const savedAgent = await this.agentRepository.save(agent);

    this.eventEmitter.emit('agent.created', { agent: savedAgent });

    return savedAgent;
  }

  async findAll(query: ListAgentsDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? { name: Like(`%${search}%`) } : {};

    const [items, total] = await this.agentRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['roles', 'roles.capabilities'],
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

  async findOne(id: string): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.capabilities'],
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async update(id: string, updateDto: UpdateAgentDto): Promise<AgentEntity> {
    const agent = await this.findOne(id);

    if (updateDto.name && updateDto.name !== agent.name) {
      const existing = await this.agentRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException('Agent with this name already exists');
      }
    }

    if (updateDto.roleIds !== undefined) {
      if (updateDto.roleIds.length > 0) {
        const roles = await this.roleRepository.findBy({
          id: In(updateDto.roleIds),
        });
        agent.roles = roles;
      } else {
        agent.roles = [];
      }
    }

    Object.assign(agent, {
      name: updateDto.name,
      description: updateDto.description,
      goal: updateDto.goal,
      config: updateDto.config,
      isActive: updateDto.isActive,
    });

    const updatedAgent = await this.agentRepository.save(agent);

    this.eventEmitter.emit('agent.updated', { agent: updatedAgent });

    return updatedAgent;
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    await this.agentRepository.remove(agent);

    this.eventEmitter.emit('agent.deleted', { agentId: id });
  }

  async execute(executeDto: ExecuteAgentDto): Promise<any> {
    const agent = await this.findOne(executeDto.id);

    if (!agent.isActive) {
      throw new ConflictException('Agent is not active');
    }

    // 触发 Agent 执行事件
    this.eventEmitter.emit('agent.execute', {
      agent,
      context: executeDto.context,
    });

    return {
      agentId: agent.id,
      agentName: agent.name,
      status: 'executing',
      message: 'Agent execution started',
      context: executeDto.context,
    };
  }
}
