import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }
  @Get() findAll() { return this.usersService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.usersService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.usersService.remove(id); }
}