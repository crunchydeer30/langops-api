import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/user.repository.interface';
import { User } from '../../domain/entities';
import { Email } from '../../domain/value-objects/email.vo';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper,
  ) {}

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    return this.mapper.toDomain(prismaUser);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.value },
    });
    return this.mapper.toDomain(prismaUser);
  }

  async save(user: User): Promise<void> {
    const persistenceData = this.mapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        ...persistenceData,
      },
      update: {
        ...persistenceData,
      },
    });
  }
}
