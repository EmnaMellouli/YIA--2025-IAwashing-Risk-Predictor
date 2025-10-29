import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Session } from './session.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  sessionId!: string;

  @ManyToOne(() => Session, s => s.submissions, { onDelete: 'CASCADE' })
  session!: Session;

  // ✅ Poste/fonction du répondant (optionnel)
  @Column({ type: 'varchar', length: 120, nullable: true })
  respondentJob!: string | null;

  @Column({ type: 'jsonb' })
  answers!: Record<string, any>;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'varchar', length: 20 })
  level!: 'Faible' | 'Moyen' | 'Élevé';

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
