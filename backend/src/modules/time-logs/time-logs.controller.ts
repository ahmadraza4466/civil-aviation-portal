import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { CreateTimeLogDto, UpdateTimeLogDto } from './dto/create-time-log.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('time-logs')
export class TimeLogsController {
    constructor(private readonly srv: TimeLogsService) { }

    @Post() create(@Body() dto: CreateTimeLogDto) { return this.srv.create(dto); }
    @Get() findAll() { return this.srv.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
    @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateTimeLogDto) { return this.srv.update(id, dto); }
    @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}
