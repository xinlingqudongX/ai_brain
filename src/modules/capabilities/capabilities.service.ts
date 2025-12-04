import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CapabilityEntity } from '../../entities/capability.entity';
import {
  CreateCapabilityDto,
  UpdateCapabilityDto,
  ListCapabilitiesDto,
} from './dto/capability.dto';

@Injectable()
export class CapabilitiesService {
  constructor(
    @InjectRepository(CapabilityEntity)
    private capabilityRepository: Repository<CapabilityEntity>,
  ) {}

  async create(createDto: CreateCapabilityDto): Promise<CapabilityEntity> {
    const existing = await this.capabilityRepository.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException('Capability with this name already exists');
    }

    const capability = this.capabilityRepository.create({
      ...createDto,
      group: createDto.group,
    });
    return await this.capabilityRepository.save(capability);
  }

  async findAll(query: ListCapabilitiesDto) {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? { name: Like(`%${search}%`) } : {};

    const [items, total] = await this.capabilityRepository.findAndCount({
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

  async findOne(id: string): Promise<CapabilityEntity> {
    const capability = await this.capabilityRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!capability) {
      throw new NotFoundException('Capability not found');
    }

    return capability;
  }

  async update(
    id: string,
    updateDto: UpdateCapabilityDto,
  ): Promise<CapabilityEntity> {
    const capability = await this.findOne(id);

    if (updateDto.name && updateDto.name !== capability.name) {
      const existing = await this.capabilityRepository.findOne({
        where: { name: updateDto.name },
      });
      if (existing) {
        throw new ConflictException('Capability with this name already exists');
      }
    }

    Object.assign(capability, {
      ...updateDto,
      group: updateDto.group,
    });
    return await this.capabilityRepository.save(capability);
  }

  async remove(id: string): Promise<void> {
    const capability = await this.findOne(id);
    await this.capabilityRepository.remove(capability);
  }
}
