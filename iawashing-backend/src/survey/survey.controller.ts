import { Controller, Post, Body, Param } from '@nestjs/common';
import { SurveyService } from './survey.service';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post(':sessionId')
  async submitSurvey(
    @Param('sessionId') sessionId: string,
    @Body() answers: Record<string, any>,
  ) {
    return this.surveyService.saveSurveyAnswers(sessionId, answers);
  }
}