import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Shift extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  engineerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  type: string; // 'Morning' | 'Evening' | 'Night' | 'Off' | 'Vacation'

  @Prop({ required: true })
  startDate: string; // YYYY-MM-DD

  @Prop({ required: true })
  endDate: string; // YYYY-MM-DD

  @Prop()
  startTime: string; // e.g. "08:00"

  @Prop()
  endTime: string; // e.g. "16:00"

  @Prop({ default: 0 })
  hours: number; // Scheduled hours

  @Prop()
  notes: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);
