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
import { CommentLikeDto } from './dto/commentLike.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './model/comment.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}
  /*==============ADD-COMMENT================*/
  async create(createCommentDto: CreateCommentDto) {
    try {
      const haveClient = await this.clientModel.findById(
        createCommentDto.userId,
      );
      const haveBlog = await this.blogModel.findById(createCommentDto.blogId);
      if (!haveBlog || !haveClient) throw new BadRequestException();
      const model = new this.commentModel({
        ...createCommentDto,
        userId: haveClient._id,
        blogId: haveBlog._id,
      });
      const newComment = await model.save();
      await this.blogModel.findByIdAndUpdate(newComment.blogId, {
        $push: { commentIds: newComment._id },
      });
      return { comment: newComment };
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============GET-ALL-COMMENTS================*/
  async findAll() {
    try {
      const comments = await this.commentModel
        .find()
        .populate('userId', ['-password', '-cPassword'])
        .populate(['blogId'])
        .populate({
          path: 'replyIds',
          populate: {
            path: 'userId',
            model: 'Client',
            select: ['-password', '-cPassword'],
          },
        })
        .exec();
      if (!comments) throw new NotFoundException();
      return { comments };
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============GET-SINGLE-COMMENT================*/
  async findMany(id: string) {
    try {
      const comment = await this.commentModel
        .find({ blogId: id })
        .populate('userId', ['-password', '-cPassword'])
        .populate(['blogId'])
        .populate({
          path: 'replyIds',
          populate: {
            path: 'userId',
            model: 'Client',
            select: ['-password', '-cPassword'],
          },
        })
        .exec();
      if (!comment) throw new NotFoundException();
      return comment;
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============EDIT-SINGLE-COMMENT================*/
  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      const comment = await this.commentModel.findByIdAndUpdate(
        id,
        { ...updateCommentDto },
        { new: true },
      );
      if (!comment) throw new NotFoundException();
      return comment;
    } catch (error) {
      console.log(error.message);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  /*==============DESTROY-SINGLE-COMMENT================*/
  async remove(id: string) {
    try {
      const deleteComment = await this.commentModel.findByIdAndDelete(id);
      if (!deleteComment) throw new NotFoundException();
      const updatedBlog = await this.blogModel.findByIdAndUpdate(
        deleteComment?.blogId,
        { $pull: { commentIds: { $in: [id] } } },
        { new: true },
      );
      return { deleteComment, updatedCometsIds: updatedBlog?.commentIds };
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
  async toggleReplyLike(payload: CommentLikeDto) {
    try {
      const client = await this.clientModel.findById(payload.userId);
      if (!client) throw new NotFoundException();
      const comment = await this.commentModel.findById(payload.commentId);
      if (!comment) throw new NotFoundException();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (client.likedComment.includes(payload.commentId)) {
        if (comment.likes < 1) throw new BadRequestException();
        await this.clientModel.findByIdAndUpdate(payload.userId, {
          $pull: { likedComment: { $in: [payload.commentId] } },
        });
        // increase like
        comment.likes--;
        await comment.save();
        return 'Like REMOVE';
      } else {
        await this.clientModel.findByIdAndUpdate(payload.userId, {
          $push: { likedComment: payload.commentId },
        });
        // increase like
        comment.likes++;
        await comment.save();
        return 'Like ADD';
      }
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      if (error.status === 400) throw new BadRequestException();
      throw new InternalServerErrorException();
    }
  }
}
