import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Part extends Document {
  @Prop({ required: true, unique: true }) partNumber: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true, default: 0 }) quantity: number;
  @Prop({ required: true }) location: string;
}
export const PartSchema = SchemaFactory.createForClass(Part);