// src/survey/survey.controller.ts
import * as express from 'express';
import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  BadRequestException,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto, SaveSurveyParamsDto } from './dto/create-survey.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('survey')
export class SurveyController {
  private readonly logger = new Logger(SurveyController.name);

  constructor(private readonly surveyService: SurveyService) {}

  @Post(':sessionId')
  async create(@Param() params: SaveSurveyParamsDto, @Body() dto: CreateSurveyDto) {
    console.log('[POST /survey/:sessionId] sessionId =', params.sessionId);
    if (!dto?.answers || typeof dto.answers !== 'object') {
      throw new BadRequestException('Le corps doit contenir un objet "answers".');
    }
    console.log('[POST /survey/:sessionId] answers keys =', Object.keys(dto.answers));
    if (dto.job) console.log('[POST /survey/:sessionId] job =', dto.job);

    const saved = await this.surveyService.saveSurveyAnswers(params.sessionId, dto.answers, dto.job);

    return {
      id: saved.id,
      score: saved.score,
      level: saved.level,
      interpretation: this.surveyService.getInterpretation(saved.score),
      createdAt: saved.createdAt,
    };
  }

  // Nouveau : POST /survey/:sessionId/feedback
  @Post(':sessionId/feedback')
  async saveFeedback(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    if (!sessionId || !sessionId.trim()) {
      throw new BadRequestException('sessionId requis dans l\'URL.');
    }

    if (dto.rating && (dto.rating < 1 || dto.rating > 5)) {
      throw new BadRequestException('rating doit être entre 1 et 5.');
    }

    const saved = await this.surveyService.saveFeedback(sessionId, {
      score: dto.score,
      rating: dto.rating,
      comment: dto.comment,
      job: dto.job,
      answers: dto.answers,
    });

    return { message: 'Feedback reçu avec succès.', id: saved.id };
  }

  @Get('history')
  async getSurveyHistory() {
    const list = await this.surveyService.getSurveyHistory();
    return list;
  }

  // GET /survey/feedbacks/export -> télécharge le CSV admin_feedbacks.csv
  @Get('feedbacks/export')
  async exportFeedbacks(@Res() res: express.Response) {
    const csvPath = this.surveyService.getFeedbacksCsvPath();
    if (!fs.existsSync(csvPath)) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Aucun feedback disponible.' });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="admin_feedbacks.csv"`);
    const stream = fs.createReadStream(csvPath);
    stream.pipe(res);
  }
}
