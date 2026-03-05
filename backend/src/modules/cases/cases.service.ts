import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case } from './schemas/case.schema';
import { CreateCaseDto, UpdateCaseDto } from './dto/create-case.dto';

@Injectable()
export class CasesService {
  constructor(@InjectModel(Case.name) private readonly model: Model<Case>) {}
  async create(dto: CreateCaseDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Case not found');
    return e;
  }
  async update(id: string, dto: UpdateCaseDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Case not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}