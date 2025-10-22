import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SurveyAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string; // Session ID

  @Column('json')
  answers: Record<string, any>; // Survey answers in JSON format

  @Column('float')
  score: number; // Use 'float' to store decimal values


  @Column()
  level: string; // The level of risk (Low, Medium, High)

  @Column()
  createdAt: Date; // Timestamp of when the survey was completed
}
