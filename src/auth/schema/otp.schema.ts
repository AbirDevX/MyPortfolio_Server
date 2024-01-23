/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from 'mongoose';
import { IOtp } from "../interface/interface";

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp extends Document implements IOtp {
    @Prop({ type: Types.ObjectId, required: true, ref: "Client" })
    userId: Types.ObjectId;
    @Prop({ type: String, required: true })
    otp: string;
    @Prop({ type: Boolean, required: true, default: false })
    isVerified: boolean;
};

export const OtpSchema = SchemaFactory.createForClass(Otp);