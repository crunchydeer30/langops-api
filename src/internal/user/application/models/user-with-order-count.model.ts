export class UserWithOrderCountModel {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  orderCount: number;
  createdAt: Date;
}
