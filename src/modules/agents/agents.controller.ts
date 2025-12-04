import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import {
  CreateAgentDto,
  UpdateAgentBodyDto,
  AgentIdDto,
  ListAgentsDto,
  ExecuteAgentDto,
} from './dto/agent.dto';

@ApiTags('Agent管理')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post('action/create')
  @ApiOperation({
    summary: '创建Agent',
    description: '创建一个新的Agent并关联角色',
  })
  @ApiResponse({ status: 201, description: 'Agent创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: 'Agent名称已存在' })
  async create(@Body() createDto: CreateAgentDto) {
    return await this.agentsService.create(createDto);
  }

  @Post('action/list')
  @ApiOperation({
    summary: '查询Agent列表',
    description: '分页查询Agent列表，支持搜索',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Body() query: ListAgentsDto) {
    return await this.agentsService.findAll(query);
  }

  @Post('action/get')
  @ApiOperation({
    summary: '获取Agent详情',
    description: '根据ID获取Agent详细信息及关联的角色和能力',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: 'Agent不存在' })
  async findOne(@Body() params: AgentIdDto) {
    return await this.agentsService.findOne(params.id);
  }

  @Post('action/update')
  @ApiOperation({
    summary: '更新Agent',
    description: '更新Agent信息和关联的角色',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: 'Agent不存在' })
  @ApiResponse({ status: 409, description: 'Agent名称已存在' })
  async update(@Body() body: UpdateAgentBodyDto) {
    const { id, ...updateDto } = body;
    return await this.agentsService.update(id, updateDto);
  }

  @Post('action/delete')
  @ApiOperation({ summary: '删除Agent', description: '根据ID删除Agent' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: 'Agent不存在' })
  async remove(@Body() params: AgentIdDto) {
    await this.agentsService.remove(params.id);
    return { message: 'Agent deleted successfully' };
  }

  @Post('action/execute')
  @ApiOperation({
    summary: '执行Agent',
    description: '手动触发Agent执行，Agent会根据AI决策执行相应能力',
  })
  @ApiResponse({ status: 200, description: '执行已启动' })
  @ApiResponse({ status: 404, description: 'Agent不存在' })
  @ApiResponse({ status: 409, description: 'Agent未激活' })
  async execute(@Body() executeDto: ExecuteAgentDto) {
    return await this.agentsService.execute(executeDto);
  }
}
