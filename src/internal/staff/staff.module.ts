import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StaffMemberRepository } from './infrastructure/repositories/staff-member.repository';
import { StaffMemberMapper } from './infrastructure/mappers/staff-member.mapper';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [StaffMemberRepository, StaffMemberMapper],
  exports: [StaffMemberRepository],
})
export class StaffModule {}
