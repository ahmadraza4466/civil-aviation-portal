import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogbookService } from './logbook.service';
import { LogbookController } from './logbook.controller';
import { Logbook, LogbookSchema } from './schemas/logbook.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Logbook.name, schema: LogbookSchema }])],
  controllers: [LogbookController],
  providers: [LogbookService],
})
export class LogbookModule {}