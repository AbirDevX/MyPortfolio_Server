/* eslint-disable prettier/prettier */

import { ObjectId, Types } from 'mongoose';

export interface IClient {
  firstName: string;
  lastName: string;
  number: string;
  email: string;
  password: string;
  cPassword: string;
  avatar: string;
  role: string;
  likedBlog: [ObjectId] | [];
  likedComment: [ObjectId] | [];
  likedReply: [ObjectId] | [];
}

export interface IHashPassword {
  password: string;
  cPassword: string;
}
export interface IClientResDto {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  number: string;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  avatar?: string;
  blogIds?: [ObjectId];
  likedBlog?: [ObjectId];
  likedComment?: [ObjectId];
  likedReply?: [ObjectId];
}
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IupdateClientPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  number?: string;
}
