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
import { CreateReplyDto } from './dto/create-reply.dto';
import { AddReplyDto } from './dto/replyLike.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { ReplyService } from './reply.service';

@Controller('comment-reply')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  /*==============ADD-REPLY================*/
  @Post()
  @UseGuards(CommentsGuard)
  async create(@Body() createReplyDto: CreateReplyDto) {
    const validatorSchema = joi.object({
      body: joi.string().required(),
      userId: joi.string().required(),
      commentId: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(createReplyDto);
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.replyService.createReply(value);
  }
  @Patch('/likes')
  @UseGuards(CommentsGuard)
  async replyLikes(@Body() addReplyDto: AddReplyDto) {
    const validatorSchema = joi.object({
      userId: joi.string().required(),
      replyId: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(addReplyDto);
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.replyService.toggleReplyLike(value);
  }
  /*==============GET-ALL-REPLY================*/
  @Get()
  @UseGuards(CommentsGuard)
  async findAll() {
    return await this.replyService.findAll();
  }
  /*==============GET-SINGLE-REPLY================*/
  @Get(':id')
  @UseGuards(CommentsGuard)
  async findOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    return await this.replyService.findOne(id);
  }
  /*==============Update-SINGLE-REPLY================*/
  @Patch(':id')
  @UseGuards(CommentsGuard)
  async updateOne(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateReplyDto,
  ) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    const validatorSchema = joi.object({
      body: joi.string().required(),
    });
    const { error, value } = await validatorSchema.validate(updateReplyDto);
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.replyService.update(id, value);
  }
  /*==============Update-SINGLE-REPLY================*/
  @Delete(':id')
  @UseGuards(CommentsGuard)
  async removeOne(@Param('id') id: string) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new BadRequestException('invalid Mongo ID!');
    return this.replyService.remove(id);
  }
}
