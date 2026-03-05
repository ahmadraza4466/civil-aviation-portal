import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class CreatePartDto {
  @IsString() @IsNotEmpty() partNumber: string;
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() quantity: number;
  @IsString() @IsNotEmpty() location: string;
}
export class UpdatePartDto {
  @IsNumber() @IsOptional() quantity?: number;
  @IsString() @IsOptional() location?: string;
}