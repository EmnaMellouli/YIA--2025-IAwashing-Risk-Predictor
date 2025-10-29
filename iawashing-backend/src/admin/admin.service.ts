import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { Submission } from './entities/submission.entity';

type SubmissionWithInterp = Submission & { interpretation: string };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Submission) private readonly subRepo: Repository<Submission>,
  ) {}

  /** Utilitaire: interprétation toujours présente (string) */
  private getInterpretationText(score?: number, fallback?: string): string {
    if (fallback && typeof fallback === 'string' && fallback.trim().length > 0) {
      return fallback;
    }
    const s = typeof score === 'number' ? score : 0;
    if (s < 40) {
      return 'Votre gouvernance IA semble robuste et alignée sur vos usages.';
    } else if (s < 70) {
      return 'Votre démarche IA est prometteuse mais manque de concrétisation ou de transparence.';
    }
    return 'Votre organisation semble communiquer davantage qu’elle ne déploie — attention au risque d’IAwashing.';
  }

  /** Utilitaire: échappement CSV */
  private csvEscape(v: any): string {
    const s = (v ?? '').toString();
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  /** Liste des sessions (avec stats simples) */
  async listSessions() {
    const sessions = await this.sessionRepo.find({ order: { createdAt: 'DESC' } });
    const withStats = await Promise.all(
      sessions.map(async (s) => {
        const submissionsCount = await this.subRepo.count({ where: { session: { id: s.id } } });
        // On garde submissionsCount (utile pour le total affiché), on ne renvoie plus la progression si tu ne la veux pas au front
        return { ...s, submissionsCount };
      }),
    );
    return withStats;
  }

  /** Création d'une session */
  async createSession(body: { title: string; description?: string; targetCount?: number }) {
    if (!body.title?.trim()) throw new BadRequestException('title required');
    const s = this.sessionRepo.create({
      title: body.title.trim(),
      description: body.description ?? '',
      targetCount: body.targetCount ?? 0,
      isArchived: false,
    });
    return this.sessionRepo.save(s);
  }

  /** Liste paginée des soumissions d'une session */
  async listSubmissions(args: { page?: number; pageSize?: number; sessionId?: string }) {
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, args.pageSize ?? 20));
    if (!args.sessionId) throw new BadRequestException('sessionId is required');

    const [items, total] = await this.subRepo.findAndCount({
      where: { session: { id: args.sessionId } },
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    // Ajoute une interprétation sûre (string) pour la réponse API
    const withInterp: SubmissionWithInterp[] = items.map((s) => {
      const interpretation = this.getInterpretationText(s.score, (s as any).interpretation);
      return { ...(s as any), interpretation };
    });

    return { items: withInterp, total, page, pageSize };
  }

  /** Export CSV (scores + niveau + interprétation + job) */
  async exportSessionCsv(sessionId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const subs = await this.subRepo.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });

    const headers = ['Date', 'Score', 'Niveau', 'Interprétation', 'Job'];

    const rows = subs.map((s) => {
      const interpText = this.getInterpretationText(s.score, (s as any).interpretation);
      return [
        s.createdAt?.toISOString?.() ?? '',
        (s.score ?? '').toString(),
        s.level ?? '',
        interpText,
        s.respondentJob ?? '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => this.csvEscape(v)).join(',')),
    ].join('\n');

    const filename = `scores_${sessionId}.csv`;
    return { filename, csv };
  }

  /** Export CSV détaillé avec réponses q1..q10 + job */
  async exportAnswersCsv(sessionId: string) {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const subs = await this.subRepo.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });

    const headers = [
      'Date',
      'Score',
      'Niveau',
      'Interprétation',
      'Job',
      'q1','q2','q3','q4','q5','q6','q7','q8','q9','q10',
    ];

    const getAnswer = (answers: any, key: string) =>
      answers?.[key] ??
      answers?.[`question${key.replace(/^q/, '')}`] ??
      answers?.[key.toUpperCase()] ??
      '';

    const rows = subs.map((s) => {
      const interpText = this.getInterpretationText(s.score, (s as any).interpretation);
      return {
        Date: s.createdAt?.toISOString?.() ?? '',
        Score: s.score ?? '',
        Niveau: s.level ?? '',
        Interprétation: interpText,
        Job: s.respondentJob ?? '',
        q1: getAnswer(s.answers, 'q1'),
        q2: getAnswer(s.answers, 'q2'),
        q3: getAnswer(s.answers, 'q3'),
        q4: getAnswer(s.answers, 'q4'),
        q5: getAnswer(s.answers, 'q5'),
        q6: getAnswer(s.answers, 'q6'),
        q7: getAnswer(s.answers, 'q7'),
        q8: getAnswer(s.answers, 'q8'),
        q9: getAnswer(s.answers, 'q9'),
        q10: getAnswer(s.answers, 'q10'),
      };
    });

    const lines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => this.csvEscape((r as any)[h])).join(',')),
    ];
    const csv = lines.join('\n');
    const filename = `reponses_${sessionId}.csv`;

    return { filename, csv };
  }

  /** Interprétation par score (publique si besoin ailleurs) */
  getInterpretation(score: number): string {
    return this.getInterpretationText(score);
  }
}
