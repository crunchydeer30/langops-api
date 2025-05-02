import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { UserWithOrderCountModel } from '../../application/models';
import { IUserQueryRepository } from '../../application/ports';

@Injectable()
export class UserQueryRepository implements IUserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUsersWithOrderCount(): Promise<UserWithOrderCountModel[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      orderCount: user._count.orders,
      createdAt: user.createdAt,
    }));
  }
}
