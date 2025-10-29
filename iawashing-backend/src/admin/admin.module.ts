import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Submission } from './entities/submission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminGateway } from './admin.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Session, Submission, AuditLog])],
  controllers: [AdminController],
  providers: [AdminService, AdminGateway],
  exports: [AdminService, AdminGateway, TypeOrmModule], // ✅ exporte aussi TypeOrmModule pour Submission
})
export class AdminModule {}
