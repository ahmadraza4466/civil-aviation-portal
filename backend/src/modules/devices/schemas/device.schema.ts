import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Device extends Document {
  @Prop({ required: true, unique: true }) code: string;
  @Prop({ required: true }) type: string;
  @Prop({ required: true }) location: string;
  @Prop({ default: 'Active' }) status: string;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);