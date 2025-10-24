import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';  // Si vous avez un fichier pour définir les types du payload
import { AuthService } from './auth.service';  // Assurez-vous que AuthService est importé

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extraction du token depuis l'en-tête Authorization
      secretOrKey: 'your-secret-key',  // La clé secrète pour signer les JWT, à remplacer par une variable d'environnement
    });
  }

  // Méthode appelée lors de la validation du token JWT
  async validate(payload: JwtPayload) {
    // Ici, vous pouvez ajouter de la logique pour valider l'utilisateur dans la base de données
    return { userId: payload.sub, username: payload.username };  // Retourne les informations de l'utilisateur
  }
}
