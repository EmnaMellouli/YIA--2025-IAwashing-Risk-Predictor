import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, SaveSurveyParamsDto } from './dto/create-survey.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // POST /survey/:sessionId
  @Post(':sessionId')
  async create(@Param() params: SaveSurveyParamsDto, @Body() dto: CreateSurveyDto) {
    const saved = await this.surveyService.saveSurveyAnswers(params.sessionId, dto.answers);
    return {
      id: saved.id,
      score: saved.score,
      level: saved.level,
      interpretation: this.surveyService.getInterpretation(saved.score), // ✅ renvoyé au front
      createdAt: saved.createdAt,
    };
  }

  // GET /survey/history
  @Get('history')
  async getSurveyHistory() {
    // ✅ renvoie déjà la liste enrichie avec "interpretation"
    return this.surveyService.getSurveyHistory();
  }
}
