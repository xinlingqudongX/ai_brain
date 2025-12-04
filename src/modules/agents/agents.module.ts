import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentEntity } from '../../entities/agent.entity';
import { RoleEntity } from '../../entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity, RoleEntity])],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}
