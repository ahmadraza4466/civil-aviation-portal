import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TimeLog extends Document {
    @Prop({ required: true }) companyCustomer: string;
    @Prop() instructor: string;
    @Prop() pilot1: string;
    @Prop() pilot2: string;
    @Prop() observer1: string;
    @Prop() observer2: string;
    @Prop({ required: true }) startTime: string;
    @Prop({ required: true }) endTime: string;
    @Prop() timeLost: string;
    @Prop({ required: true }) totalTrainingTime: string;
    @Prop({ required: true }) configuration: string;
    @Prop({ required: true }) simulatorUsedAs: string;
    @Prop({ type: [String] }) timelogSubmitTo: string[];
    @Prop() qualityLevel: number;
    @Prop() comment: string;
    @Prop() engineerOnDuty: string;
    @Prop() customerEmail: string;
    @Prop({ default: false }) includeInSnag: boolean;
}

export const TimeLogSchema = SchemaFactory.createForClass(TimeLog);
