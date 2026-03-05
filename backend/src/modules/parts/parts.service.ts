import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Part } from './schemas/part.schema';
import { CreatePartDto, UpdatePartDto } from './dto/create-part.dto';

@Injectable()
export class PartsService {
  constructor(@InjectModel(Part.name) private readonly model: Model<Part>) {}
  async create(dto: CreatePartDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Part not found');
    return e;
  }
  async update(id: string, dto: UpdatePartDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Part not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}