/* eslint-disable prettier/prettier */

import { ObjectId } from 'mongoose';

export interface IAuthor {
  name: string;
  img: string;
  designation: string;
}
export interface IBlog {
  category: string;
  title: string;
  subtitle: string;
  description: string;
  img: string;
  published: string;
  author: IAuthor;
  userId: ObjectId;
  likes: number;
  commentIds: [ObjectId];
}

export interface IComment {
  likes: number;
  body: string;
  userId: ObjectId;
  blogId: ObjectId;
}

export interface IReply {
  likes: number;
  body: string;
  commentId: ObjectId;
}