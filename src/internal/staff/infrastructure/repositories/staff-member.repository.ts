import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { IStaffMemberRepository } from '../../domain/ports/staff-member.repository.interface';
import { StaffMember } from '../../domain/entities/staff-member.entity';
import { StaffMemberMapper } from '../mappers/staff-member.mapper';
import { Email } from '@common/domain/value-objects/email.vo';

@Injectable()
export class StaffMemberRepository implements IStaffMemberRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: StaffMemberMapper,
  ) {}

  async findById(id: string): Promise<StaffMember | null> {
    const model = await this.prisma.staffMember.findUnique({ where: { id } });
    if (!model) {
      return null;
    }
    return this.mapper.toDomain(model);
  }

  async findByEmail(email: Email): Promise<StaffMember | null> {
    const model = await this.prisma.staffMember.findUnique({
      where: { email: email.value },
    });
    if (!model) {
      return null;
    }
    return this.mapper.toDomain(model);
  }

  async save(staffMember: StaffMember): Promise<StaffMember> {
    const data = this.mapper.toPersistence(staffMember);

    const model = await this.prisma.staffMember.upsert({
      where: { id: staffMember.id },
      update: data,
      create: data,
    });

    return this.mapper.toDomain(model);
  }
}
