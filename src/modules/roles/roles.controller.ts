import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleBodyDto,
  RoleIdDto,
  ListRolesDto,
} from './dto/role.dto';

@ApiTags('角色管理')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('action/create')
  @ApiOperation({
    summary: '创建角色',
    description: '创建一个新的角色并可选关联能力',
  })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '角色名称已存在' })
  async create(@Body() createDto: CreateRoleDto) {
    return await this.rolesService.create(createDto);
  }

  @Post('action/list')
  @ApiOperation({
    summary: '查询角色列表',
    description: '分页查询角色列表，支持搜索',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Body() query: ListRolesDto) {
    return await this.rolesService.findAll(query);
  }

  @Post('action/get')
  @ApiOperation({
    summary: '获取角色详情',
    description: '根据ID获取角色详细信息及关联的能力',
  })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async findOne(@Body() params: RoleIdDto) {
    return await this.rolesService.findOne(params.id);
  }

  @Post('action/update')
  @ApiOperation({
    summary: '更新角色',
    description: '更新角色信息和关联的能力',
  })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '角色名称已存在' })
  async update(@Body() body: UpdateRoleBodyDto) {
    const { id, ...updateDto } = body;
    return await this.rolesService.update(id, updateDto);
  }

  @Post('action/delete')
  @ApiOperation({ summary: '删除角色', description: '根据ID删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async remove(@Body() params: RoleIdDto) {
    await this.rolesService.remove(params.id);
    return { message: 'Role deleted successfully' };
  }
}
