import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/create-device.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('devices')
export class DevicesController {
  constructor(private readonly srv: DevicesService) {}
  @Post() create(@Body() dto: CreateDeviceDto) { return this.srv.create(dto); }
  @Get() findAll() { return this.srv.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.srv.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) { return this.srv.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.srv.remove(id); }
}