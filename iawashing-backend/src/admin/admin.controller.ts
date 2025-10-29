import { Controller, Get, Post, Body, Query, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  /** Liste des sessions (avec submissionsCount & progress %) */
  @Get('sessions')
  listSessions() {
    return this.admin.listSessions();
  }

  /** Création d'une session */
  @Post('sessions')
  createSession(
    @Body() body: { title: string; description?: string; targetCount?: number },
  ) {
    return this.admin.createSession(body);
  }

  /** Liste paginée des soumissions (sessionId requis côté service) */
  @Get('submissions')
  listSubmissions(@Query() q: { page?: string; pageSize?: string; sessionId?: string }) {
    return this.admin.listSubmissions({
      page: Number(q.page),
      pageSize: Number(q.pageSize),
      sessionId: q.sessionId,
    });
  }

  /** Export CSV des scores/niveaux/interprétations */
  @Get('sessions/:sessionId/export')
  async exportCsv(@Param('sessionId') sessionId: string, @Res({ passthrough: true }) res: Response) {
    const { filename, csv } = await this.admin.exportSessionCsv(sessionId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  /** ✅ NOUVEAU : Export CSV détaillé avec réponses q1..q10 */
  @Get('sessions/:sessionId/export-answers')
  async exportAnswersCsv(@Param('sessionId') sessionId: string, @Res({ passthrough: true }) res: Response) {
    const { filename, csv } = await this.admin.exportAnswersCsv(sessionId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
