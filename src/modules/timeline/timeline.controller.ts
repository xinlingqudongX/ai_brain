import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TimelineNotifierService } from './timeline-notifier.service';
import {
  CreateTimelineNotifierDto,
  UpdateTimelineNotifierBodyDto,
  TimelineNotifierIdDto,
  ListTimelineNotifiersDto,
} from './dto/timeline-notifier.dto';

@ApiTags('时间线通知器')
@Controller('timeline')
export class TimelineController {
  constructor(
    private readonly timelineNotifierService: TimelineNotifierService,
  ) {}

  @Post('action/create')
  @ApiOperation({
    summary: '创建时间线通知器',
    description: '创建定时任务，广播事件给订阅的Agent',
  })
  @ApiResponse({ status: 201, description: '通知器创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '事件名称已存在' })
  async create(@Body() createDto: CreateTimelineNotifierDto) {
    return await this.timelineNotifierService.create(createDto);
  }

  @Post('action/list')
  @ApiOperation({
    summary: '查询通知器列表',
    description: '分页查询时间线通知器',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Body() query: ListTimelineNotifiersDto) {
    return await this.timelineNotifierService.findAll(query);
  }

  @Post('action/get')
  @ApiOperation({
    summary: '获取通知器详情',
    description: '根据ID获取时间线通知器详细信息',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '通知器不存在' })
  async findOne(@Body() params: TimelineNotifierIdDto) {
    return await this.timelineNotifierService.findOne(params.id);
  }

  @Post('action/update')
  @ApiOperation({ summary: '更新通知器', description: '更新时间线通知器信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '通知器不存在' })
  @ApiResponse({ status: 409, description: '事件名称已存在' })
  async update(@Body() body: UpdateTimelineNotifierBodyDto) {
    const { id, ...updateDto } = body;
    return await this.timelineNotifierService.update(id, updateDto);
  }

  @Post('action/delete')
  @ApiOperation({
    summary: '删除通知器',
    description: '根据ID删除时间线通知器',
  })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '通知器不存在' })
  async remove(@Body() params: TimelineNotifierIdDto) {
    await this.timelineNotifierService.remove(params.id);
    return { message: 'Timeline notifier deleted successfully' };
  }

  @Post('action/trigger')
  @ApiOperation({
    summary: '手动触发事件',
    description: '立即触发指定的时间线事件',
  })
  @ApiResponse({ status: 200, description: '触发成功' })
  @ApiResponse({ status: 404, description: '通知器不存在' })
  async trigger(@Body() params: TimelineNotifierIdDto) {
    await this.timelineNotifierService.triggerEvent(params.id);
    return { message: 'Event triggered successfully' };
  }
}
