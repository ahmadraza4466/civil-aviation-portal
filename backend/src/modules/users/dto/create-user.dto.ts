import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() name: string;
  @IsEnum(['admin', 'engineer']) role: string;
}