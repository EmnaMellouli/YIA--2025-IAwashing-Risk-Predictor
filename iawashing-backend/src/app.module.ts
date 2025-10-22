import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyModule } from './survey/survey.module';
import { SurveyAnswer } from './survey/entities/survey.entity';
import { SurveyController } from './survey/survey.controller';
import { SurveyService } from './survey/survey.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'openpg',
      password: 'openpgpwd',
      database: 'iawashing_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SurveyAnswer]), // Add this line to register the SurveyAnswer entity
  ],
  controllers: [AppController, SurveyController], // Register SurveyController here
  providers: [AppService, SurveyService],       // Register SurveyService here
})
export class AppModule {}
