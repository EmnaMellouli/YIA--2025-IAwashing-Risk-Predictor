import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSurveyDto {
  @IsObject()
  answers!: Record<string, any>;
}

export class SaveSurveyParamsDto {
  @IsString()
  @MaxLength(120)
  sessionId!: string;
}

// Optionnel : si tu veux accepter un champ `source`/`metadata`
export class OptionalMeta {
  @IsOptional() @IsString() @MaxLength(120)
  source?: string;
}
