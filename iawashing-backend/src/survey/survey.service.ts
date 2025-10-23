import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyAnswer } from './entities/survey.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(SurveyAnswer)
    private surveyRepository: Repository<SurveyAnswer>,
  ) {}

  // Enregistrer les réponses et calculer le score
  async saveSurveyAnswers(sessionId: string, answers: Record<string, any>): Promise<SurveyAnswer> {
    try {
      const sanitizedSessionId = (sessionId || '').trim();
      if (!sanitizedSessionId) {
        throw new BadRequestException('sessionId requis');
      }

      const { score, level } = this.computeScore(answers);

      // ⚠️ En prod, évite de logger toutes les réponses (privacy)
      console.log('Score calculé:', score, 'Niveau:', level);

      const surveyAnswer = this.surveyRepository.create({
        sessionId: sanitizedSessionId,
        answers,
        score,
        level, // 'Faible' | 'Moyen' | 'Élevé'
        createdAt: new Date(),
      });

      return await this.surveyRepository.save(surveyAnswer);
    } catch (error) {
      console.error('Erreur dans saveSurveyAnswers:', error);
      throw new Error('Erreur lors de la sauvegarde des réponses du sondage');
    }
  }

  /**
   * Calcul du score IAwashing conforme au backlog (pondérations + flags + interprétation).
   * - Sous-indices en [0..1]
   * - Pondérations: 25% (Gouvernance), 30% (Cas d’usage/valeur), 20% (Confiance), 25% (Éthique/Sécurité)
   * - Score final: 100 - (somme pondérée en points) + flags, clampé et arrondi à [0..100]
   * - Interprétation: <40 = Faible, 40–69 = Moyen, ≥70 = Élevé
   */
  private computeScore(answers: Record<string, any>) {
  // Compatibilité: accepte q1..q10 OU question1..question10
  const A = (k: string) => answers[`q${k}`] ?? answers[`question${k}`] ?? answers[k];

  const q1  = A('1'),  q2  = A('2'),  q3  = A('3'),  q4  = A('4'),  q5  = A('5');
  const q6  = A('6'),  q7  = A('7'),  q8  = A('8'),  q9  = A('9'),  q10 = A('10');

  // Barèmes -> fractions 0..1
  const yesNoEnCours = (a?: string) => a === 'Oui' ? 1 : a === 'En cours' ? 0.5 : 0;
  const yesNo        = (a?: string) => a === 'Oui' ? 1 : 0;
  const yesNoPartiel = (a?: string) => a === 'Oui' ? 1 : a === 'Partiel' ? 0.5 : 0;
  const range0123p   = (a?: string) => a === '0' ? 0 : a === '1-2' ? 0.5 : a === '3+' ? 1 : 0;
  const transparence = (a?: string) => a === 'Oui' ? 1 : a === 'Je ne sais pas' ? 0.25 : 0;

  // Sous-indices (fractions)
  const GovIndex       = (yesNoEnCours(q1) + yesNo(q2)) / 2;
  const UseCaseIndex   = (range0123p(q3) + yesNoPartiel(q4)) / 2;
  const TrustIndex     = (transparence(q5) + yesNoPartiel(q6)) / 2;
  const EthicsSecIndex = (yesNo(q7) + yesNoPartiel(q8)) / 2;

  // Pondération en points (0..100)
  const weightedPoints =
    GovIndex * 25 +
    UseCaseIndex * 30 +
    TrustIndex * 20 +
    EthicsSecIndex * 25;

  // Flags
  let flags = 0;
  if (q9 === 'Oui' && (q3 === '0' || q3 === '1-2')) flags += 15;
  if (q10 === '>12 mois') flags += 10;

  // Score final en points
  let score = 100 - weightedPoints + flags;
  score = Math.round(Math.max(0, Math.min(100, score)));

  // Interprétation
  let level: 'Faible' | 'Moyen' | 'Élevé' = 'Faible';
  if (score >= 40 && score < 70) level = 'Moyen';
  else if (score >= 70) level = 'Élevé';

  return { score, level };
}


  // Optionnel : utile si tu veux renvoyer un texte au front
  getInterpretation(score: number): string {
    if (score < 40) {
      return 'Votre gouvernance IA semble robuste et alignée sur vos usages.';
    } else if (score < 70) {
      return 'Votre démarche IA est prometteuse mais manque de concrétisation ou de transparence.';
    }
    return 'Votre organisation semble communiquer davantage qu’elle ne déploie — attention au risque d’IAwashing.';
  }
}
