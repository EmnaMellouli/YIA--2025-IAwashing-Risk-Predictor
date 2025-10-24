import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';  // Import de la stratégie JWT

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key',  // Clé secrète pour signer les JWT
      signOptions: { expiresIn: '60s' },  // Durée de validité du token
    }),
  ],
  controllers: [AuthController],  // Assurez-vous d'ajouter le contrôleur
  providers: [AuthService, JwtStrategy],  // Ajoutez le service Auth et la stratégie JWT
})
export class AuthModule {}
