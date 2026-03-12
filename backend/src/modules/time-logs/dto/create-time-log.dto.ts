import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsBoolean, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateTimeLogDto {
    @IsString() @IsNotEmpty() companyCustomer: string;
    @IsString() @IsOptional() instructor?: string;
    @IsString() @IsOptional() pilot1?: string;
    @IsString() @IsOptional() pilot2?: string;
    @IsString() @IsOptional() observer1?: string;
    @IsString() @IsOptional() observer2?: string;
    @IsString() @IsNotEmpty() startTime: string;
    @IsString() @IsNotEmpty() endTime: string;
    @IsString() @IsOptional() timeLost?: string;
    @IsString() @IsNotEmpty() totalTrainingTime: string;
    @IsString() @IsNotEmpty() configuration: string;
    @IsString() @IsNotEmpty() simulatorUsedAs: string;
    @IsArray() @IsString({ each: true }) @IsOptional() timelogSubmitTo?: string[];
    @IsNumber() @IsOptional() qualityLevel?: number;
    @IsString() @IsOptional() comment?: string;
    @IsString() @IsOptional() engineerOnDuty?: string;
    @IsString() @IsOptional() customerEmail?: string;
    @IsBoolean() @IsOptional() includeInSnag?: boolean;
}

export class UpdateTimeLogDto extends PartialType(CreateTimeLogDto) { }
