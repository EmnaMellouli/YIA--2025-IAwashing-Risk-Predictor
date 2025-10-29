import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { SurveyAnswer } from './entities/survey.entity';

// ✅ ajoute ces imports
import { Submission } from '../admin/entities/submission.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    // ✅ expose les repos nécessaires à SurveyService
    TypeOrmModule.forFeature([SurveyAnswer, Submission]),
    // ✅ pour injecter AdminGateway
    AdminModule,
  ],
  controllers: [SurveyController],
  providers: [SurveyService],
  exports: [SurveyService],
})
export class SurveyModule {}
