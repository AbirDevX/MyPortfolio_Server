/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { Ipayload } from "../interface/interface";

export type ContactsDetailsDocument = HydratedDocument<ContactsDetails>;
@Schema({
    timestamps: true
})
export class ContactsDetails extends Document implements Ipayload {
    @Prop({ type: String, required: true })
    clientName: string;

    @Prop({ type: String, required: true })
    contactEmail: string;

    @Prop({ type: String, required: true })
    contactNumber: string;

    @Prop({ type: String, required: true })
    message: string;
}

// create schema
export const ContactsDetailSchema = SchemaFactory.createForClass(ContactsDetails);
