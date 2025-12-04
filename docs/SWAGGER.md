# Swagger API 文档使用指南

## 访问 Swagger UI

启动应用后，访问：
```
http://localhost:3000/api-docs
```

## Swagger UI 功能

### 1. 查看所有 API 端点
Swagger UI 会自动列出所有可用的 API 端点，按照 Tag 分组：
- **角色管理**: 所有角色相关的操作
- **能力管理**: 所有能力相关的操作

### 2. 查看请求参数
点击任意 API 端点，可以看到：
- 请求方法 (POST)
- 请求路径
- 请求参数说明（包括类型、是否必填、描述）
- 响应示例

### 3. 在线测试 API
1. 点击 API 端点展开详情
2. 点击 "Try it out" 按钮
3. 填写请求参数
4. 点击 "Execute" 执行请求
5. 查看响应结果

### 4. 查看响应状态码
每个 API 都标注了可能的响应状态码：
- **200/201**: 成功
- **400**: 参数验证失败
- **404**: 资源不存在
- **409**: 冲突（如名称重复）

## API 端点说明

### 角色管理 API

#### POST /roles/action/create
创建新角色

**请求参数**:
```json
{
  "name": "DBA",
  "description": "数据库管理员",
  "prompt": "你是一名专业的数据库管理员",
  "capabilityIds": ["uuid1", "uuid2"]
}
```

#### POST /roles/action/list
查询角色列表

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "search": "DBA"
}
```

#### POST /roles/action/get
获取角色详情

**请求参数**:
```json
{
  "id": "role-uuid"
}
```

#### POST /roles/action/update
更新角色

**请求参数**:
```json
{
  "id": "role-uuid",
  "name": "Senior DBA",
  "description": "高级数据库管理员",
  "prompt": "你是一名资深的数据库管理员",
  "isActive": true,
  "capabilityIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### POST /roles/action/delete
删除角色

**请求参数**:
```json
{
  "id": "role-uuid"
}
```

### 能力管理 API

#### POST /capabilities/action/create
创建新能力

**请求参数**:
```json
{
  "name": "数据库操作",
  "description": "执行数据库查询和操作",
  "prompt": "你可以执行 SQL 查询、分析查询性能"
}
```

#### POST /capabilities/action/list
查询能力列表

**请求参数**:
```json
{
  "page": 1,
  "limit": 10,
  "search": "数据库"
}
```

#### POST /capabilities/action/get
获取能力详情

**请求参数**:
```json
{
  "id": "capability-uuid"
}
```

#### POST /capabilities/action/update
更新能力

**请求参数**:
```json
{
  "id": "capability-uuid",
  "name": "高级数据库操作",
  "description": "执行复杂的数据库查询和优化",
  "prompt": "你可以执行复杂的 SQL 查询、性能调优",
  "isActive": true
}
```

#### POST /capabilities/action/delete
删除能力

**请求参数**:
```json
{
  "id": "capability-uuid"
}
```

## 使用 Swagger 测试完整流程

### 示例：创建 DBA 角色

1. **创建能力 1**
   - 打开 `POST /capabilities/action/create`
   - 点击 "Try it out"
   - 输入：
     ```json
     {
       "name": "数据库操作",
       "description": "执行数据库查询和操作",
       "prompt": "你可以执行 SQL 查询、分析查询性能、优化数据库操作"
     }
     ```
   - 点击 "Execute"
   - 复制返回的 `id`

2. **创建能力 2**
   - 重复上述步骤，创建 "SQL 检查" 能力
   - 复制返回的 `id`

3. **创建能力 3**
   - 重复上述步骤，创建 "数据库配置" 能力
   - 复制返回的 `id`

4. **创建 DBA 角色**
   - 打开 `POST /roles/action/create`
   - 点击 "Try it out"
   - 输入：
     ```json
     {
       "name": "DBA",
       "description": "数据库管理员",
       "prompt": "你是一名专业的数据库管理员",
       "capabilityIds": ["能力1的id", "能力2的id", "能力3的id"]
     }
     ```
   - 点击 "Execute"

5. **查询角色详情**
   - 打开 `POST /roles/action/get`
   - 点击 "Try it out"
   - 输入角色 ID
   - 点击 "Execute"
   - 查看角色信息及关联的能力

## Swagger 配置说明

### 在 Controller 中添加文档注解

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('角色管理')  // 设置 Tag，用于分组
@Controller('roles')
export class RolesController {
  @Post('action/create')
  @ApiOperation({ 
    summary: '创建角色',  // 简短描述
    description: '创建一个新的角色并可选关联能力'  // 详细描述
  })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @ApiResponse({ status: 409, description: '角色名称已存在' })
  async create(@Body() createDto: CreateRoleDto) {
    return await this.rolesService.create(createDto);
  }
}
```

### 在 DTO 中添加字段描述

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateRoleSchema = z.object({
  name: z.string().min(1).max(100).describe('角色名称'),
  description: z.string().min(1).describe('角色描述'),
  prompt: z.string().min(1).describe('角色提示词'),
  capabilityIds: z.array(z.string().uuid()).default([]).describe('关联的能力ID列表')
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
```

## 导出 API 文档

### 获取 OpenAPI JSON
访问：
```
http://localhost:3000/api-docs-json
```

可以将 JSON 导入到其他工具（如 Postman、Insomnia）中使用。

## 优势

1. **自动生成**: 基于代码自动生成，无需手动维护
2. **实时更新**: 代码修改后文档自动更新
3. **交互式测试**: 直接在浏览器中测试 API
4. **类型安全**: 结合 Zod 和 TypeScript，确保类型一致性
5. **易于分享**: 可以导出 OpenAPI 规范与团队共享

## 注意事项

1. **生产环境**: 考虑是否需要在生产环境暴露 Swagger UI
2. **认证**: 如果 API 需要认证，需要在 Swagger 中配置认证方式
3. **性能**: Swagger 文档生成会略微增加启动时间
