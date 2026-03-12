import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { Case, CaseSchema } from './schemas/case.schema';
import { TimeLog, TimeLogSchema } from '../time-logs/schemas/time-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Case.name, schema: CaseSchema },
      { name: TimeLog.name, schema: TimeLogSchema }
    ])
  ],
  controllers: [CasesController],
  providers: [CasesService],
})
export class CasesModule { }