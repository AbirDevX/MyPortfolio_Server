/* eslint-disable prettier/prettier */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../../clients/schema/client.schema';
import { Blog, BlogDocument } from '../schema/blog.schema';
import { CreateReplyDto } from './dto/create-reply.dto';
import { AddReplyDto } from './dto/replyLike.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Comment, CommentDocument } from './model/comment.model';
import { Reply, ReplyDocument } from './model/reply.model';

@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Reply.name) private readonly replyModel: Model<ReplyDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}
  /*==============ADD-REPLY================*/
  async createReply(createReplyDto: CreateReplyDto) {
    try {
      const haveClient = await this.clientModel.findById(createReplyDto.userId);
      const haveComment = await this.commentModel.findById(
        createReplyDto.commentId,
      );
      if (!haveComment || !haveClient) throw new NotFoundException();
      const model = new this.replyModel({
        ...createReplyDto,
        userId: haveClient._id,
        blogId: haveComment._id,
      });
      // REPLY save on DB
      const newReply = await model.save();
      // Relation update
      await this.commentModel.findByIdAndUpdate(newReply.commentId, {
        $push: { replyIds: newReply._id },
      });
      return { reply: newReply };
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  async toggleReplyLike(payload: AddReplyDto) {
    try {
      const client = await this.clientModel.findById(payload.userId);
      if (!client) throw new NotFoundException();
      const replyComment = await this.replyModel.findById(payload.replyId);
      if (!replyComment) throw new NotFoundException();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (client.likedReply.includes(payload.replyId)) {
        if (replyComment.likes < 1) throw new BadRequestException();
        await this.clientModel.findByIdAndUpdate(payload.userId, {
          $pull: { likedReply: { $in: [payload.replyId] } },
        });
        // increase like
        replyComment.likes--;
        await replyComment.save();
        return 'Like REMOVE';
      } else {
        await this.clientModel.findByIdAndUpdate(payload.userId, {
          $push: { likedReply: payload.replyId },
        });
        // increase like
        replyComment.likes++;
        await replyComment.save();
        return 'Like ADD';
      }
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============GET-ALL================*/
  async findAll() {
    try {
      const replyes = await this.replyModel
        .find()
        .populate('userId', ['-password', '-cPassword'])
        .populate(['commentId'])
        .exec();
      if (!replyes) throw new NotFoundException();
      return replyes;
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============GET-SINGLE================*/
  async findOne(id: string) {
    try {
      const reply = await this.replyModel
        .findById(id)
        .populate('userId', ['-password', '-cPassword'])
        .populate(['commentId'])
        .exec();
      if (!reply) throw new NotFoundException();
      return reply;
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============UPDATE-REPLY================*/
  async update(id: string, updateReplyDto: UpdateReplyDto) {
    try {
      const updatedReply = await this.replyModel.findByIdAndUpdate(
        id,
        { ...updateReplyDto },
        { new: true },
      );
      if (!updatedReply) throw new NotFoundException();
      return updatedReply;
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============DESTROY-REPLY================*/
  async remove(id: string) {
    try {
      const deletedReply = await this.replyModel.findByIdAndDelete(id);
      if (!deletedReply) throw new NotFoundException();
      const updatedReplyIds = await this.commentModel.findByIdAndUpdate(
        deletedReply.commentId,
        { $pull: { replyIds: { $in: [id] } } },
        { new: true },
      );
      return {
        deletedReply,
        updatedReplyIdsFromComments: updatedReplyIds?.replyIds,
      };
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
}
