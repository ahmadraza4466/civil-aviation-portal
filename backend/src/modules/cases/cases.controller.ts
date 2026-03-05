import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/create-case.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('cases')
export class CasesController {
  constructor(private readonly srv: CasesService) {}
  @Post() create(@Body() dto: CreateCaseDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateCaseDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}