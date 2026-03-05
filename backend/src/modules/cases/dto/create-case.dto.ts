import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
export class CreateCaseDto {
  @IsString() @IsNotEmpty() sequenceNumber: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() deviceId: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsNotEmpty() reportedBy: string;
  @IsString() @IsOptional() assignedTo?: string;
  @IsArray() @IsOptional() actions?: any[];
}
export class UpdateCaseDto {
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() deviceId?: string;
  @IsString() @IsOptional() assignedTo?: string;
  @IsArray() @IsOptional() actions?: any[];
}