import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { UserWithOrderCountModel } from './application/models';
import { GetUsersWithOrderCountQuery } from './application/queries';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('with-order-count')
  @ApiOkResponse({
    description: 'Returns users with their order counts.',
    type: [UserWithOrderCountModel],
  })
  async getUsersWithOrderCount(): Promise<UserWithOrderCountModel[]> {
    return this.queryBus.execute(new GetUsersWithOrderCountQuery());
  }
}
