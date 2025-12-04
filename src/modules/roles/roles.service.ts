import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { RoleEntity } from '../../entities/role.entity';
import { CapabilityEntity } from '../../entities/capability.entity';
import { CreateRoleDto, UpdateRoleDto, ListRolesDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(CapabilityEntity)
    private capabilityRepository: Repository<CapabilityEntity>,
  ) {}

  async create(createDto: CreateRoleDto): Promise<RoleEntity> {
    const existing = await this.roleRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.roleRepository.create({
      name: createDto.name,
      description: createDto.description,
      prompt: createDto.prompt,
      group: createDto.group,
    });

    if (createDto.capabilityIds && createDto.capabilityIds.length > 0) {
      const capabilities = await this.capabilityRepository.findBy({
        id: In(createDto.capabilityIds),
      });
      role.capabilities = capabilities;
    }

    return await this.roleRepository.save(role);
  }

  async findAll(query: ListRolesDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? { name: Like(`%${search}%`) } : {};

    const [items, total] = await this.roleRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['capabilities'],
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

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['capabilities'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.findOne(id);

    if (updateDto.name && updateDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    if (updateDto.capabilityIds !== undefined) {
      if (updateDto.capabilityIds.length > 0) {
        const capabilities = await this.capabilityRepository.findBy({
          id: In(updateDto.capabilityIds),
        });
        role.capabilities = capabilities;
      } else {
        role.capabilities = [];
      }
    }

    Object.assign(role, {
      name: updateDto.name,
      description: updateDto.description,
      prompt: updateDto.prompt,
      group: updateDto.group,
      isActive: updateDto.isActive,
    });

    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
