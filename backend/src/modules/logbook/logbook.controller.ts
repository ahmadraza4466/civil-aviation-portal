import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { CreateLogbookDto, UpdateLogbookDto } from './dto/create-logbook.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('logbook')
export class LogbookController {
  constructor(private readonly srv: LogbookService) {}
  @Post() create(@Body() dto: CreateLogbookDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLogbookDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}