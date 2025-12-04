import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from '../../entities/role.entity';
import { CapabilityEntity } from '../../entities/capability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, CapabilityEntity])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
