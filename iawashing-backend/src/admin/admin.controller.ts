// src/admin/admin.controller.ts
import { Controller, Get, Post, Body, Query, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  /** Liste des sessions */
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

  /** Liste paginée des soumissions */
  @Get('submissions')
  listSubmissions(@Query() q: { page?: string; pageSize?: string; sessionId?: string }) {
    return this.admin.listSubmissions({
      page: Number(q.page),
      pageSize: Number(q.pageSize),
      sessionId: q.sessionId,
    });
  }

  /**
   * Télécharger le CSV combiné des feedbacks/réponses/scores
   * - Si un fichier physique admin_feedbacks_<sessionId>.csv existe dans ADMIN_CSV_PATH (ou cwd),
   *   il sera servi.
   * - Sinon le CSV sera généré à la volée depuis la BDD (via admin.exportFeedbackCsv) puis renvoyé.
   */
  @Get('download-feedback') 
  async downloadFeedback(@Res() res: Response) {
     // ✅ Chemin absolu vers le CSV existant 
     const filePath = path.resolve( 'C:\\Users\\LENOVO\\Desktop\\python\\YIA -2025-IAwashing Risk Predictor\\iawashing-backend\\admin_feedbacks.csv', );
      // Vérification de l’existence 
      if (!fs.existsSync(filePath)) {
         res.status(404).send('Fichier admin_feedbacks.csv introuvable.'); 
         return; 
      } 
      // Envoi du fichier pour téléchargement 
      res.setHeader('Content-Type', 'text/csv; charset=utf-8'); 
      res.setHeader( 'Content-Disposition', 'attachment; filename="admin_feedbacks.csv"', );
      const fileStream = fs.createReadStream(filePath); fileStream.pipe(res); 
    } }
