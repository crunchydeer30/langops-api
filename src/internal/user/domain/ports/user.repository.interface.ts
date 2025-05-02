import { User } from '../entities';
import { Email } from '../value-objects/email.vo';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
