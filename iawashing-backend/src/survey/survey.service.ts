import { Submission } from '../admin/entities/submission.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyAnswer } from './entities/survey.entity';
import { AdminGateway } from '../admin/admin.gateway';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Submission)
    private readonly subsRepo: Repository<Submission>,    // écrit dans "submissions"

    private readonly adminGateway: AdminGateway,          // push temps réel au dashboard

    @InjectRepository(SurveyAnswer)
    private readonly surveyRepository: Repository<SurveyAnswer>, // écrit dans "survey_answer"
  ) {}

  /**
   * Enregistrer une réponse et calculer score + niveau
   * @param sessionId UUID de la session (obligatoire)
   * @param answers   réponses q1..q10
   * @param job       poste/fonction (optionnel)
   */
  async saveSurveyAnswers(sessionId: string, answers: Record<string, any>, job?: string): Promise<SurveyAnswer> {
    try {
      const sanitizedSessionId = (sessionId || '').trim();
      if (!sanitizedSessionId) throw new BadRequestException('sessionId required');

      const { score, level } = this.computeScore(answers);

      // 1) Persister dans la table SUBMISSIONS (utilisée par l'admin)
      const sub = this.subsRepo.create({
        sessionId: sanitizedSessionId,
        answers,
        score,
        level,
        respondentJob: job ?? undefined, // ✅ stocker le poste côté submissions (utilisation de undefined au lieu de null)
      });
      const savedSub = await this.subsRepo.save(sub);

      // 2) Émettre l’événement WebSocket pour le dashboard admin
      this.adminGateway.emitSessionUpdate(sanitizedSessionId, {
        score,
        level,
        createdAt: savedSub.createdAt,
      });

      // 3) Persister aussi dans la table SURVEY_ANSWER (historique)
      const surveyAnswer = this.surveyRepository.create({
        sessionId: sanitizedSessionId,
        answers,
        score,
        level,                      // 'Faible' | 'Moyen' | 'Élevé'
        respondentJob: job ?? undefined, // ✅ stocker le poste côté survey_answer (si la colonne existe)
        createdAt: new Date(),      // si @CreateDateColumn existe, tu peux enlever
      });

      return await this.surveyRepository.save(surveyAnswer);  // Sauvegarder l'entité dans la base
    } catch (error) {
      console.error('Error in saveSurveyAnswers:', error);
      throw new Error('Error saving survey responses');
    }
  }

  /** Historique enrichi d'une interprétation textuelle */
  async getSurveyHistory(): Promise<Array<{
    id: string;
    createdAt: Date;
    score: number;
    level: 'Faible' | 'Moyen' | 'Élevé';
    interpretation: string;
  }>> {
    try {
      const rows = await this.surveyRepository.find({
        order: { createdAt: 'DESC' },
      });

      return rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        score: r.score,
        level: r.level as 'Faible' | 'Moyen' | 'Élevé',
        interpretation: this.getInterpretation(r.score),
      }));
    } catch (error) {
      console.error('Error in getSurveyHistory:', error);
      throw new Error('Error retrieving survey history');
    }
  }

  // -------- Calcul du score (conforme backlog) --------
  private computeScore(answers: Record<string, any>) {
    const A = (k: string) => answers[`q${k}`] ?? answers[`question${k}`] ?? answers[k];

    const q1  = A('1'),  q2  = A('2'),  q3  = A('3'),  q4  = A('4'),  q5  = A('5');
    const q6  = A('6'),  q7  = A('7'),  q8  = A('8'),  q9  = A('9'),  q10 = A('10');

    const yesNoEnCours = (a?: string) => (a === 'Oui' ? 1 : a === 'En cours' ? 0.5 : 0);
    const yesNo        = (a?: string) => (a === 'Oui' ? 1 : 0);
    const yesNoPartiel = (a?: string) => (a === 'Oui' ? 1 : a === 'Partiel' ? 0.5 : 0);
    const range0123p   = (a?: string) => (a === '0' ? 0 : a === '1-2' ? 0.5 : a === '3+' ? 1 : 0);
    const transparence = (a?: string) => (a === 'Oui' ? 1 : a === 'Je ne sais pas' ? 0.25 : 0);

    const GovIndex       = (yesNoEnCours(q1) + yesNo(q2)) / 2;
    const UseCaseIndex   = (range0123p(q3) + yesNoPartiel(q4)) / 2;
    const TrustIndex     = (transparence(q5) + yesNoPartiel(q6)) / 2;
    const EthicsSecIndex = (yesNo(q7) + yesNoPartiel(q8)) / 2;

    const weightedPoints =
      GovIndex * 25 +
      UseCaseIndex * 30 +
      TrustIndex * 20 +
      EthicsSecIndex * 25;

    let flags = 0;
    if (q9 === 'Oui' && (q3 === '0' || q3 === '1-2')) flags += 15;
    if (q10 === '>12 mois') flags += 10;

    let score = 100 - weightedPoints + flags;
    score = Math.round(Math.max(0, Math.min(100, score)));

    let level: 'Faible' | 'Moyen' | 'Élevé' = 'Faible';
    if (score >= 40 && score < 70) level = 'Moyen';
    else if (score >= 70) level = 'Élevé';

    return { score, level };
  }

  // Texte d’interprétation (cohérent UI/admin)
  getInterpretation(score: number): string {
    if (score < 40) {
      return 'Votre gouvernance IA semble robuste et alignée sur vos usages.';
    } else if (score < 70) {
      return 'Votre démarche IA est prometteuse mais manque de concrétisation ou de transparence.';
    }
    return 'Votre organisation semble communiquer davantage qu’elle ne déploie — attention au risque d’IAwashing.';
  }
}
