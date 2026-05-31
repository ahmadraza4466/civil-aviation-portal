import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  engineerId: string;

  @IsNotEmpty()
  @IsString()
  type: string; // 'Morning' | 'Evening' | 'Night' | 'Off' | 'Vacation'

  @IsNotEmpty()
  @IsString()
  startDate: string; // YYYY-MM-DD

  @IsNotEmpty()
  @IsString()
  endDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  engineerId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
