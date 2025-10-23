import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('survey_answers')
export class SurveyAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  sessionId!: string;

  // Stocke toutes les réponses telles que reçues du front
  @Column({ type: 'jsonb' })
  answers!: Record<string, any>;

  @Column({ type: 'int' })
  score!: number; // 0..100 arrondi

  @Column({ type: 'varchar', length: 20 })
  level!: 'Faible' | 'Moyen' | 'Élevé';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
