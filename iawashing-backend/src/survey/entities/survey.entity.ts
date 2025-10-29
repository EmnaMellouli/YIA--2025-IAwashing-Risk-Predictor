import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('survey_answers')
export class SurveyAnswer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 120 })
  sessionId!: string;

  // Store all answers as received from the front end
  @Column({ type: 'jsonb' })
  answers!: Record<string, any>;

  @Column({ type: 'int' })
  score!: number; // 0..100 rounded

  @Column({ type: 'varchar', length: 20 })
  level!: 'Faible' | 'Moyen' | 'Élevé';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'text', nullable: true })
  interpretation?: string;

  // Ajout de la colonne respondentJob
  @Column({ type: 'varchar', length: 120, nullable: true })
  respondentJob?: string;
}
