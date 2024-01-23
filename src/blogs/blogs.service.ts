/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import * as Jimp from 'jimp';
import * as Joi from 'joi';
import { Model } from 'mongoose';
import { join } from 'path';
import { Client, ClientDocument } from '../clients/schema/client.schema';
import { UtilityService } from '../utility/utility.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogDocument } from './schema/blog.schema';
@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    private readonly utilityService: UtilityService,
  ) {}
  async create(createBlogDto: CreateBlogDto, req: Request) {
    const validationSchema = Joi.object({
      title: Joi.string().required(),
      subtitle: Joi.string().required(),
      category: Joi.string().required(),
      img: Joi.string().required(),
      description: Joi.string().required(),
      published: Joi.string().required(),
      author: {
        name: Joi.string().required().min(2).max(20),
        designation: Joi.string().required().min(2).max(20),
        img: Joi.string().required(),
      },
    });
    const { error, value } = validationSchema.validate(createBlogDto);

    if (error) {
      // console.log(error)
      throw new BadRequestException(error.details[0].message);
    }
    /*============== specify the Image path ================*/
    let posterImgPath;
    let authorImgPath;
    try {
      const posterRowimg = createBlogDto.img.split(',');
      const authorRowImg = createBlogDto.author.img.split(',');
      /*============== compress thr poster img ================*/
      if (posterRowimg.length > 1) {
        const buffer = Buffer.from(posterRowimg[1], 'base64');
        const compressData = await Jimp.read(buffer);
        /*============== POSTER  ================*/
        posterImgPath = `${Date.now()}_${Math.round(Math.random() * 1e9)}.png`;
        if (process.env.NODE_ENV === 'development') {
          await compressData
            .resize(850, Jimp.AUTO)
            .write(
              join(
                __dirname,
                '../..',
                `/src/public/blogs/poster/${posterImgPath}`,
              ),
            );
        } else {
          await compressData
            .resize(850, Jimp.AUTO)
            .write(
              join(
                __dirname,
                '../..',
                `/dist/public/blogs/poster/${posterImgPath}`,
              ),
            );
        }
      }
      /*============== AUTHOR  ================*/
      if (authorRowImg.length > 1) {
        const buffer = Buffer.from(authorRowImg[1], 'base64');
        const compressData = await Jimp.read(buffer);
        //
        authorImgPath = `${Date.now()}_${Math.round(Math.random() * 1e9)}.png`;
        //
        if (process.env.NODE_ENV === 'development') {
          await compressData
            .resize(150, Jimp.AUTO)
            .write(
              join(
                __dirname,
                '../..',
                `/src/public/blogs/author/${authorImgPath}`,
              ),
            );
        } else {
          await compressData
            .resize(150, Jimp.AUTO)
            .write(
              join(
                __dirname,
                '../..',
                `/dist/public/blogs/author/${authorImgPath}`,
              ),
            );
        }
      }

      //   Create Blog
      const newBlog = new this.blogModel();
      newBlog.title = value.title;
      newBlog.subtitle = value.subtitle;
      newBlog.category = createBlogDto.category;
      newBlog.img = posterImgPath;
      newBlog.description = value.description;
      newBlog.published = value.published;
      newBlog.author = {
        name: value.author.name,
        designation: value.author.designation,
        img: authorImgPath,
      };
      newBlog.userId = req['user']?._id;

      // save blog on DB
      const result = await newBlog.save();
      await this.clientModel.findByIdAndUpdate(req['user']?._id, {
        $push: { blogIds: result?._id },
      });
      return result;
    } catch (error) {
      console.log(error);

      if (posterImgPath) {
        await this.utilityService.toDeleteFile(
          `./*/public/blogs/poster/${posterImgPath}`,
        );
      }

      //  todo not work
      if (authorImgPath) {
        await this.utilityService.toDeleteFile(
          `./*/public/blogs/author/${authorImgPath}`,
        );
      }
      if (error.status === 400) {
        throw new BadRequestException();
      } else if (error.status === 401) {
        throw new UnauthorizedException();
      } else if (error?.code === 11000) {
        const msg = error?.keyValue?.email ? 'email' : 'number';
        throw new BadRequestException(`${msg}`);
      } else {
        console.log(error?.message, error?.status);
        throw new InternalServerErrorException();
      }
    }
  }

  async getPosts(pageNo: number, limit: number) {
    const startIndex = (pageNo - 1) * limit;
    const endIndex = pageNo * limit;
    try {
      const blogs = await this.blogModel.find();
      // .limit(endIndex)
      // .skip(startIndex)
      // .exec(); // Pagination From DB
      // console.log()
      if (!blogs) throw new NotFoundException();
      const result = blogs.slice(startIndex, endIndex); // Pagination
      // const pageQuentity = this.getPageQuentity(blogs.length, limit);
      return {
        blogs: result,
        totalLength: blogs.length,
      };
    } catch (error) {
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }
  async blogPagination(limit: number, skip: number) {
    try {
      const result = await this.blogModel.aggregate([
        { $skip: skip },
        { $limit: limit },
      ]);
      if (!result) throw new NotFoundException();
      return result;
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }

  async findAll() {
    try {
      const blogs = await this.blogModel.find().exec();
      if (!blogs) throw new NotFoundException();
      return blogs;
    } catch (error) {
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }
  async findOne(id: string) {
    try {
      const blog = await await this.blogModel.findOne({ _id: id });
      if (!blog) throw new NotFoundException();
      return blog;
    } catch (error) {
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
