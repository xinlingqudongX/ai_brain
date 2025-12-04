import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CapabilitiesService } from './capabilities.service';
import {
  CreateCapabilityDto,
  UpdateCapabilityBodyDto,
  CapabilityIdDto,
  ListCapabilitiesDto
} from './dto/capability.dto';

@ApiTags('能力管理')
@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  @Post('action/create')
  @ApiOperation({ summary: '创建能力', description: '创建一个新的能力' })
  @ApiResponse({ status: 201, description: '能力创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '能力名称已存在' })
  async create(@Body() createDto: CreateCapabilityDto) {
    return await this.capabilitiesService.create(createDto);
  }

  @Post('action/list')
  @ApiOperation({ summary: '查询能力列表', description: '分页查询能力列表，支持搜索' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Body() query: ListCapabilitiesDto) {
    return await this.capabilitiesService.findAll(query);
  }

  @Post('action/get')
  @ApiOperation({ summary: '获取能力详情', description: '根据ID获取能力详细信息及关联的角色' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '能力不存在' })
  async findOne(@Body() params: CapabilityIdDto) {
    return await this.capabilitiesService.findOne(params.id);
  }

  @Post('action/update')
  @ApiOperation({ summary: '更新能力', description: '更新能力信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '能力不存在' })
  @ApiResponse({ status: 409, description: '能力名称已存在' })
  async update(@Body() body: UpdateCapabilityBodyDto) {
    const { id, ...updateDto } = body;
    return await this.capabilitiesService.update(id, updateDto);
  }

  @Post('action/delete')
  @ApiOperation({ summary: '删除能力', description: '根据ID删除能力' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '能力不存在' })
  async remove(@Body() params: CapabilityIdDto) {
    await this.capabilitiesService.remove(params.id);
    return { message: 'Capability deleted successfully' };
  }
}
