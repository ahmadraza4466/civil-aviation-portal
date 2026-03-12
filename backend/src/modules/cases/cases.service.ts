import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Case } from './schemas/case.schema';
import { TimeLog } from '../time-logs/schemas/time-log.schema';
import { CreateCaseDto, UpdateCaseDto } from './dto/create-case.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case.name) private readonly model: Model<Case>,
    @InjectModel(TimeLog.name) private readonly timeLogModel: Model<TimeLog>
  ) { }
  async create(dto: CreateCaseDto) { return new this.model(dto).save(); }
  async findAll() {
    const cases = await this.model.find().exec();
    const timeLogs = await this.timeLogModel.find({ includeInSnag: true }).exec();

    const mappedLogs = timeLogs.map((log: any) => ({
      _id: log._id,
      sequenceNumber: 'TL-' + log._id.toString().substring(0, 4).toUpperCase(),
      title: 'Time Log: ' + log.companyCustomer,
      deviceId: log.configuration,
      description: log.comment || 'Time Log auto-included as Snag',
      status: 'Open',
      reportedBy: log.instructor || log.companyCustomer || 'Unknown',
      assignedTo: log.engineerOnDuty || 'Unassigned',
      actions: [],
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      isTimeLog: true
    }));

    // Convert mongoose documents to plain objects or rely on NestJS serialization 
    // but mixing arrays requires us to return plain objects ideally, or standard responses.
    // The controller returns it, Nest JS JSON stringifies it. 
    return [...cases, ...mappedLogs].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Sort newest first
    });
  }
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