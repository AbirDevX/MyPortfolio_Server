/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { Client, ClientSchema } from '../clients/schema/client.schema';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CommentModule } from './comment/comment.module';
import { Blog, BlogSchema } from './schema/blog.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    ClientsModule,
    AuthModule,
    CommentModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
