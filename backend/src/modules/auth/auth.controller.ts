import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) { return this.authService.login(loginDto); }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Request() req) { return req.user; }
}