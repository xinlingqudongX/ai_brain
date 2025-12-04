import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import {
  CreateTimelineEventDto,
  UpdateTimelineEventBodyDto,
  TimelineEventIdDto,
  ListTimelineEventsDto,
} from './dto/timeline-event.dto';

@ApiTags('时间线管理')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post('action/create')
  @ApiOperation({
    summary: '创建时间线事件',
    description: '为Agent创建定时或周期性事件',
  })
  @ApiResponse({ status: 201, description: '事件创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 404, description: 'Agent不存在' })
  async create(@Body() createDto: CreateTimelineEventDto) {
    return await this.timelineService.create(createDto);
  }

  @Post('action/list')
  @ApiOperation({
    summary: '查询时间线事件列表',
    description: '分页查询时间线事件，支持按Agent、状态、类型筛选',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Body() query: ListTimelineEventsDto) {
    return await this.timelineService.findAll(query);
  }

  @Post('action/get')
  @ApiOperation({
    summary: '获取事件详情',
    description: '根据ID获取时间线事件详细信息',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '事件不存在' })
  async findOne(@Body() params: TimelineEventIdDto) {
    return await this.timelineService.findOne(params.id);
  }

  @Post('action/update')
  @ApiOperation({ summary: '更新事件', description: '更新时间线事件信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '事件不存在' })
  async update(@Body() body: UpdateTimelineEventBodyDto) {
    const { id, ...updateDto } = body;
    return await this.timelineService.update(id, updateDto);
  }

  @Post('action/delete')
  @ApiOperation({ summary: '删除事件', description: '根据ID删除时间线事件' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '事件不存在' })
  async remove(@Body() params: TimelineEventIdDto) {
    await this.timelineService.remove(params.id);
    return { message: 'Timeline event deleted successfully' };
  }

  @Post('action/execute')
  @ApiOperation({
    summary: '手动执行事件',
    description: '立即执行指定的时间线事件',
  })
  @ApiResponse({ status: 200, description: '执行成功' })
  @ApiResponse({ status: 404, description: '事件不存在' })
  async execute(@Body() params: TimelineEventIdDto) {
    await this.timelineService.executeEvent(params.id);
    return { message: 'Event executed successfully' };
  }
}
