import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: autorise explicitement les origines de ton front
  app.enableCors({
    origin: [
      'http://localhost:3001', // CRA par défaut
      'http://localhost:5173', // Vite (si tu l’utilises)
      'http://localhost:3000', // au cas où front et back partagent le port/proxy
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  // Validation globale: nettoie le payload + transforme les types + bloque les champs non attendus
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // supprime les champs non listés dans les DTOs
      forbidNonWhitelisted: true, // renvoie 400 si champs inconnus
      transform: true,            // transforme params/query en types attendus (utile pour DTO)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(3000);
  console.log(`✅ API démarrée sur http://localhost:3000`);
}
bootstrap();
