import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersWithOrderCountQuery } from './get-users-with-order-count.query';
import { UserWithOrderCountModel } from '../../models';
import { UserQueryRepository } from 'src/internal/user/infrastructure';

@QueryHandler(GetUsersWithOrderCountQuery)
export class GetUsersWithOrderCountHandler
  implements
    IQueryHandler<GetUsersWithOrderCountQuery, UserWithOrderCountModel[]>
{
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  async execute(): Promise<UserWithOrderCountModel[]> {
    return this.userQueryRepository.findUsersWithOrderCount();
  }
}
