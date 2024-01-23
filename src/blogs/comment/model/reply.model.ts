/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, ObjectId } from 'mongoose';
import { IReply } from 'src/blogs/interface/interface';

@Schema({ timestamps: true })
export class Reply extends Document implements IReply {
  @Prop({ type: Number, default: 0 })
  likes: number;
  @Prop()
  body: string;
  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Comment' })
  commentId: ObjectId;
  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Client' })
  userId: ObjectId;
}

export type ReplyDocument = HydratedDocument<Reply>;

export const ReplySchema = SchemaFactory.createForClass(Reply);
