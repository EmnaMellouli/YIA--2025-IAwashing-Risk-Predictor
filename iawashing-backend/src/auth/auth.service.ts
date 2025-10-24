import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Méthode pour générer un token JWT pour l'utilisateur (admin par exemple)
  async generateJwtToken(user: any): Promise<string> {
    const payload = { username: user.username, sub: user.userId };  // Payload avec des infos comme le nom d'utilisateur et l'ID
    return this.jwtService.sign(payload);  // Générez le token JWT
  }
}
