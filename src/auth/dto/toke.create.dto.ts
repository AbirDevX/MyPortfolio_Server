/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

export class TokenCreateDto {
    userId: Types.ObjectId;
    token: string;
}
