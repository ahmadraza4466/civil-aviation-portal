import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Logbook extends Document {
  @Prop({ required: true }) entryCode: string;
  @Prop({ required: true }) authorId: string;
  @Prop({ required: true }) notes: string;
  @Prop({ required: true }) deviceId: string;
}
export const LogbookSchema = SchemaFactory.createForClass(Logbook);