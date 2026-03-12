import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeLog } from './schemas/time-log.schema';
import { CreateTimeLogDto, UpdateTimeLogDto } from './dto/create-time-log.dto';

@Injectable()
export class TimeLogsService {
    constructor(@InjectModel(TimeLog.name) private readonly model: Model<TimeLog>) { }

    async create(dto: CreateTimeLogDto) { return new this.model(dto).save(); }

    async findAll() { return this.model.find().exec(); }

    async findOne(id: string) {
        const e = await this.model.findById(id);
        if (!e) throw new NotFoundException('TimeLog not found');
        return e;
    }

    async update(id: string, dto: UpdateTimeLogDto) {
        const e = await this.model.findByIdAndUpdate(id, dto, { new: true });
        if (!e) throw new NotFoundException('TimeLog not found');
        return e;
    }

    async remove(id: string) { return this.model.findByIdAndDelete(id); }
}
