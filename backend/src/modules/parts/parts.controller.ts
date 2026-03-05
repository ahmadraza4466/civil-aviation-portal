import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto, UpdatePartDto } from './dto/create-part.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('parts')
export class PartsController {
  constructor(private readonly srv: PartsService) {}
  @Post() create(@Body() dto: CreatePartDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdatePartDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}