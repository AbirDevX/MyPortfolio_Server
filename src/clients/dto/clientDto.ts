/* eslint-disable prettier/prettier */
import { ObjectId, Types } from 'mongoose';
import { IClientResDto } from '../interface/interface';

export class ClientDto {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  number: string;
  email: string;
  avatar: string;
  role: string;
  likedBlog: [ObjectId];
  likedComment: [ObjectId];
  likedReply: [ObjectId];
  createdAt: Date;
  updatedAt: Date;

  constructor(client: IClientResDto) {
    this._id = client._id;
    this.firstName = client.firstName;
    this.lastName = client.lastName;
    this.number = client.number;
    this.email = client.email;
    this.avatar = client.avatar;
    this.role = client.role;
    this.likedBlog = client.likedBlog;
    this.likedComment = client.likedComment;
    this.likedReply = client.likedReply;
    this.createdAt = client.createdAt;
    this.updatedAt = client.updatedAt;
  }
}
