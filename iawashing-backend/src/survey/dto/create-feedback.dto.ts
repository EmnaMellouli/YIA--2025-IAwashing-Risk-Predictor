// src/survey/dto/create-feedback.dto.ts
import { IsOptional, IsString, IsNumber, Min, Max, IsObject } from 'class-validator';

export class CreateFeedbackDto {
  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  job?: string;

  @IsOptional()
  @IsObject()
  answers?: Record<string, any>;
}
