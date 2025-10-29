import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSurveyDto {
  @IsObject()
  answers!: Record<string, any>;

  // ✅ Nouveau: champ optionnel "job" (poste/fonction)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  job?: string;
}

export class SaveSurveyParamsDto {
  @IsString()
  @MaxLength(120)
  sessionId!: string;
}

// (Optionnel) métadonnées si besoin plus tard
export class OptionalMeta {
  @IsOptional() @IsString() @MaxLength(120)
  source?: string;
}
