import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument, ObjectId } from 'mongoose';
import { IComment } from 'src/blogs/interface/interface';

@Schema({ timestamps: true })
export class Comment extends Document implements IComment {
  @Prop({ type: Number, default: 0 })
  likes: number;
  @Prop()
  body: string;
  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Client' })
  userId: ObjectId;
  @Prop({ type: mongoose.Schema.ObjectId, required: true, ref: 'Blog' })
  blogId: ObjectId;
  @Prop({ type: [mongoose.Schema.ObjectId], ref: 'Reply', default: [] })
  replyIds: [ObjectId];
}

export type CommentDocument = HydratedDocument<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment);
