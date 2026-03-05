import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logbook } from './schemas/logbook.schema';
import { CreateLogbookDto, UpdateLogbookDto } from './dto/create-logbook.dto';

@Injectable()
export class LogbookService {
  constructor(@InjectModel(Logbook.name) private readonly model: Model<Logbook>) {}
  async create(dto: CreateLogbookDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Logbook entry not found');
    return e;
  }
  async update(id: string, dto: UpdateLogbookDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Logbook entry not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}