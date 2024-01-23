/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, ObjectId } from 'mongoose';
import { IAuthor, IBlog } from '../interface/interface';

@Schema()
export class Author extends Document implements IAuthor {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  img: string;
  @Prop({ type: String, required: true })
  designation: string;
}

const AuthorSchema = SchemaFactory.createForClass(Author);

export type BlogDocument = HydratedDocument<Blog>;
@Schema({ timestamps: true })
export class Blog extends Document implements IBlog {
  @Prop({ type: String, required: true })
  category: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  subtitle: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  img: string;
  @Prop({ type: String, required: true })
  published: string;
  @Prop({ type: AuthorSchema, required: true })
  author: IAuthor;
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Client', required: true })
  userId: ObjectId;
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Comment', default: [] })
  commentIds: [ObjectId];
  @Prop({ type: Number, default: 0 })
  likes: number;
}

// create schema
export const BlogSchema = SchemaFactory.createForClass(Blog);
