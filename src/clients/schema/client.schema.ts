/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, ObjectId } from 'mongoose';
import {
  IClient,
  UserRole
} from '../interface/interface';

/*==============  ================*/
export type ClientDocument = HydratedDocument<Client>;
@Schema({
  timestamps: true,
  toJSON: {
    getters: true,
  },
})
export class Client extends Document implements IClient {
  @Prop({ type: String, required: true })
  firstName: string;
  @Prop({ type: String, required: true })
  lastName: string;
  @Prop({ type: String, required: true, unique: true })
  email: string;
  @Prop({ type: String, required: true, unique: true })
  number: string;
  @Prop({
    type: String,
    default: 'user.png',
    get: (avatar: string) => `${process.env.SERVER_URL}/uploads/${avatar}`,
  })
  avatar: string;
  @Prop({ type: String, required: true })
  password: string;
  @Prop({ type: String, required: true })
  cPassword: string;
  @Prop({ type: String, enum: UserRole, required: true })
  role: string;
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Blog', default: [] })
  blogIds: [ObjectId];
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Blog', default: [] })
  likedBlog: [ObjectId];
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Comment', default: [] })
  likedComment: [ObjectId];
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Reply', default: [] })
  likedReply: [ObjectId];
}

// create schema
export const ClientSchema = SchemaFactory.createForClass(Client);
