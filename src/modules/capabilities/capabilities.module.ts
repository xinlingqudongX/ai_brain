import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapabilitiesController } from './capabilities.controller';
import { CapabilitiesService } from './capabilities.service';
import { CapabilityEntity } from '../../entities/capability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CapabilityEntity])],
  controllers: [CapabilitiesController],
  providers: [CapabilitiesService],
  exports: [CapabilitiesService]
})
export class CapabilitiesModule {}
