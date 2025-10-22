 import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyAnswer } from './entities/survey.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(SurveyAnswer)
    private surveyRepository: Repository<SurveyAnswer>,
  ) {}

  // Method to save survey answers and calculate score
  async saveSurveyAnswers(sessionId: string, answers: Record<string, any>): Promise<SurveyAnswer> {
  try {
    // Remove any unwanted whitespace or newline characters from sessionId
    const sanitizedSessionId = sessionId.trim();

    // Calculate the score based on answers
    const { score, level } = this.computeScore(answers);

    // Log inputs for debugging
    console.log('Survey Answers:', answers);
    console.log('Calculated Score:', score);
    console.log('Calculated Level:', level);

    // Create a new instance of SurveyAnswer with the necessary data
    const surveyAnswer = this.surveyRepository.create({
      sessionId: sanitizedSessionId, // Use sanitized sessionId
      answers,
      score,
      level, // Store the calculated level (Low/Medium/High)
      createdAt: new Date(),
    });

    // Save the instance to the database and return it
    return await this.surveyRepository.save(surveyAnswer); // Ensure it's awaited
  } catch (error) {
    console.error('Error in saveSurveyAnswers:', error);
    throw new Error('Error saving survey answers');
  }
}


  // Logic to calculate the IAwashing Risk score
  private computeScore(answers: any) {
    // Access individual answers directly from the object
    const q1 = answers.question1;
    const q2 = answers.question2;
    const q3 = answers.question3;
    const q4 = answers.question4;
    const q5 = answers.question5;
    const q6 = answers.question6;
    const q7 = answers.question7;
    const q8 = answers.question8;
    const q9 = answers.question9;
    const q10 = answers.question10;

    // Calculate the sub-indices
    const GovIndex = (q1 === 'Yes' || q1 === 'No' ? 1 : 0) + (q2 === 'Yes' || q2 === 'No' ? 1 : 0);
    const UseCaseIndex = (q3 === '1-2' ? 1 : (q3 === '3+' ? 2 : 0)) + (q4 === 'Yes' ? 1 : 0);
    const TrustIndex = (q5 === 'Yes' ? 1 : 0) + (q6 === 'No' ? 0 : 1);
    const EthicsSecIndex = (q7 === 'Yes' ? 1 : 0) + (q8 === 'No' ? 0 : 1);

    // Apply flags based on specific conditions
    let flags = 0;
    if (q9 === 'Yes' && q3 === '0') flags += 15;
    if (q10 === '6 months') flags += 10;

    // Calculate the final score
    const score = 100 - (GovIndex * 0.25 + UseCaseIndex * 0.3 + TrustIndex * 0.2 + EthicsSecIndex * 0.25) + flags;

    // Determine the level of the score
    let level = 'Low';
    if (score >= 40 && score < 70) level = 'Medium';
    else if (score >= 70) level = 'High';

    return { score, level };
  }
}
