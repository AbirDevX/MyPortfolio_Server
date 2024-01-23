/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import * as joi from 'joi';
import mongoose from 'mongoose';
import { CommentsGuard } from './comment.guard';
import { CommentService } from './comment.service';
import { CommentLikeDto } from './dto/commentLike.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /*==============ADD-COMMENT================*/
  @Post()
  @UseGuards(CommentsGuard)
  async create(@Body() createCommentDto: CreateCommentDto) {
    const validatorSchema = joi.object({
      body: joi.string().required(),
      userId: joi.string().required(),
      blogId: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(createCommentDto);
    // console.log(error)
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.commentService.create(value);
  }
  @Patch('/likes')
  @UseGuards(CommentsGuard)
  async replyLikes(@Body() addReplyDto: CommentLikeDto) {
    const validatorSchema = joi.object({
      userId: joi.string().required(),
      commentId: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(addReplyDto);
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.commentService.toggleReplyLike(value);
  }
  /*==============GET-ALL-COMMENTS================*/
  @Get()
  @UseGuards(CommentsGuard)
  async findAll() {
    return await this.commentService.findAll();
  }
  /*==============GET-SINGLE-COMMENT================*/
  @Get(':id')
  @UseGuards(CommentsGuard)
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    return await this.commentService.findMany(id);
  }
  /*==============EDIT-SINGLE-COMMENT================*/
  @Patch(':id')
  @UseGuards(CommentsGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    const validatorSchema = joi.object({
      body: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(updateCommentDto);
    // console.log(error)
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.commentService.update(id, value);
  }
  /*==============DESTROY-SINGLE-COMMENT================*/
  @Delete(':id')
  @UseGuards(CommentsGuard)
  async remove(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    return await this.commentService.remove(id);
  }
}
