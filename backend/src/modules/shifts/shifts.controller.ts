import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/create-shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  create(@Body() dto: CreateShiftDto) {
    return this.shiftsService.create(dto);
  }

  @Get()
  findAll(
    @Query('month') month?: string,
    @Query('engineerId') engineerId?: string,
  ) {
    return this.shiftsService.findAll(month, engineerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }
}