import { UserWithOrderCountModel } from '../models';

export interface IUserQueryRepository {
  findUsersWithOrderCount(): Promise<UserWithOrderCountModel[]>;
}
export const USER_QUERY_REPOSITORY = 'USER_QUERY_REPOSITORY';
