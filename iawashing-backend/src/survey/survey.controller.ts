import { Controller, Get, Param, Body, Post, BadRequestException } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, SaveSurveyParamsDto } from './dto/create-survey.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  // POST /survey/:sessionId
  @Post(':sessionId')
  async create(@Param() params: SaveSurveyParamsDto, @Body() dto: CreateSurveyDto) {
    // Petits logs de debug (à désactiver en prod si besoin)
    console.log('[POST /survey/:sessionId] sessionId =', params.sessionId);
    if (!dto?.answers || typeof dto.answers !== 'object') {
      throw new BadRequestException('Le corps doit contenir un objet "answers".');
    }
    console.log('[POST /survey/:sessionId] answers keys =', Object.keys(dto.answers));
    if (dto.job) console.log('[POST /survey/:sessionId] job =', dto.job);

    // ✅ Passer "job" jusqu’au service
    const saved = await this.surveyService.saveSurveyAnswers(params.sessionId, dto.answers, dto.job);

    // Réponse light pour le front
    return {
      id: saved.id,
      score: saved.score,
      level: saved.level,
      interpretation: this.surveyService.getInterpretation(saved.score),
      createdAt: saved.createdAt,
    };
  }

  // GET /survey/history
  @Get('history')
  async getSurveyHistory() {
    // Le service renvoie déjà la liste enrichie avec "interpretation"
    const list = await this.surveyService.getSurveyHistory();
    return list;
  }
}
