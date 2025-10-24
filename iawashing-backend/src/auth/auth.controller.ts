import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: { username: string, password: string }) {
    // Vous pouvez ajouter la logique pour vérifier l'utilisateur dans la base de données ici.
    const admin = { userId: 1, username: user.username };  // Simulez un utilisateur authentifié
    const token = await this.authService.generateJwtToken(admin);  // Générez le token JWT pour l'utilisateur
    return { access_token: token };  // Renvoie le token JWT
  }
}
