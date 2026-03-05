import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from './schemas/device.schema';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/create-device.dto';

@Injectable()
export class DevicesService {
  constructor(@InjectModel(Device.name) private readonly model: Model<Device>) {}
  async create(dto: CreateDeviceDto) { return new this.model(dto).save(); }
  async findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const e = await this.model.findById(id);
    if (!e) throw new NotFoundException('Device not found');
    return e;
  }
  async update(id: string, dto: UpdateDeviceDto) {
    const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
    if (!e) throw new NotFoundException('Device not found');
    return e;
  }
  async remove(id: string) { return this.model.findByIdAndDelete(id); }
}