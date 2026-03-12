import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeLogsService } from './time-logs.service';
import { TimeLogsController } from './time-logs.controller';
import { TimeLog, TimeLogSchema } from './schemas/time-log.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: TimeLog.name, schema: TimeLogSchema }])],
    controllers: [TimeLogsController],
    providers: [TimeLogsService],
    exports: [TimeLogsService, MongooseModule]
})
export class TimeLogsModule { }
