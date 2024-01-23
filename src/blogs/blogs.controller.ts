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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BlogsGuard } from './blogs.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(BlogsGuard)
  async create(@Body() createBlogDto: CreateBlogDto, @Req() req: Request) {
    return await this.blogsService.create(createBlogDto, req);
  }

  @Get('pagination')
  @UseGuards(BlogsGuard)
  getBlogWithPagination(@Query() querySting) {
    if (!querySting?.skip || !querySting?.limit)
      throw new BadRequestException();
    const skip = +querySting?.skip || 0;
    const limit = +querySting?.limit || 3;

    // return this.blogsService.getPosts(pageNo, limit);
    return this.blogsService.blogPagination(limit, skip);
  }
  @Get('')
  @UseGuards(BlogsGuard)
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  @UseGuards(BlogsGuard)
  async findOne(@Param('id') id: string) {
    return await this.blogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(+id);
  }
}
