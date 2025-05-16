import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticateStaffCommand } from './authenticate-staff.command';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserRole } from '../../interfaces/jwt-payload.interface';
import { Email } from '@common/domain/value-objects';
import { StaffMemberRepository } from 'src/internal/staff/infrastructure/repositories/staff-member.repository';

@CommandHandler(AuthenticateStaffCommand)
export class AuthenticateStaffHandler
  implements ICommandHandler<AuthenticateStaffCommand, { accessToken: string }>
{
  private readonly logger = new Logger(AuthenticateStaffHandler.name);

  constructor(
    private readonly staffRepository: StaffMemberRepository,
    private readonly jwtService: JwtService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    props,
  }: AuthenticateStaffCommand): Promise<{ accessToken: string }> {
    this.logger.log(`Authenticating staff member: ${props.email}`);
    const { email, password } = props;

    const staffMember = await this.staffRepository.findByEmail(
      Email.create(email),
    );

    if (!staffMember) {
      this.logger.warn(
        `Failed to authenticate staff member: Staff member with email ${email} not found`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await staffMember.comparePassword(password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Failed to authenticate staff member: Invalid password for ${email}`,
      );
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.logger.log(`Issuing access token for staff member: ${email}`);
    const payload: JwtPayload = {
      id: staffMember.id,
      roles: [UserRole.ADMIN],
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(
      `Successfully authenticated staff member with ID: ${staffMember.id}, email: ${email}`,
    );

    return { accessToken };
  }
}
