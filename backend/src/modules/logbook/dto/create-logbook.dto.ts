import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateLogbookDto {
  @IsString() @IsNotEmpty() entryCode: string;
  @IsString() @IsNotEmpty() authorId: string;
  @IsString() @IsNotEmpty() notes: string;
  @IsString() @IsNotEmpty() deviceId: string;
}
export class UpdateLogbookDto {
  @IsString() @IsOptional() notes?: string;
}