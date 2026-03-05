import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateDeviceDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsNotEmpty() location: string;
  @IsString() @IsOptional() status?: string;
}
export class UpdateDeviceDto {
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() location?: string;
  @IsString() @IsOptional() status?: string;
}