/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../../clients/schema/client.schema';
import { Blog, BlogSchema } from '../schema/blog.schema';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment, CommentSchema } from './model/comment.model';
import { Reply, ReplySchema } from './model/reply.model';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Reply.name, schema: ReplySchema },
    ]),
  ],
  controllers: [CommentController, ReplyController],
  providers: [CommentService, ReplyService],
  exports: [CommentService, ReplyService],
})
export class CommentModule {}
