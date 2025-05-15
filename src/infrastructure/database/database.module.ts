import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ISensitiveDataTokenMap } from 'src/internal/order/domain/types/sensitive-data.types';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// Prisma json types
declare global {
  namespace PrismaJson {
    export type SensitiveDataTokenMap = ISensitiveDataTokenMap;
  }
}
