import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CaseAction {
  @Prop({ required: true }) message: string;
  @Prop({ required: true }) timestamp: string;
  @Prop({ required: true }) author: string;
}
export const CaseActionSchema = SchemaFactory.createForClass(CaseAction);

@Schema({ timestamps: true })
export class Case extends Document {
  @Prop({ required: true, unique: true }) sequenceNumber: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) deviceId: string;
  @Prop({ required: true }) description: string;
  @Prop({ default: 'Open' }) status: string;
  @Prop({ required: true }) reportedBy: string;
  @Prop({ required: false }) assignedTo?: string;
  @Prop({ type: [CaseActionSchema], default: [] }) actions: CaseAction[];
}
export const CaseSchema = SchemaFactory.createForClass(Case);