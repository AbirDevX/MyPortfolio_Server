/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from 'mongoose';
import { IrefreshToken } from "../interface/interface";

export type TokenDocument = HydratedDocument<Tokens>;

@Schema({ timestamps: true })
export class Tokens extends Document implements IrefreshToken {
    @Prop({ type: Types.ObjectId, required: true, ref: "Client" })
    userId: Types.ObjectId;
    @Prop({ type: String, required: true })
    token: string
    @Prop({ type: String, required: true })
    tokenTwo: string
};

export const TokenSchema = SchemaFactory.createForClass(Tokens);