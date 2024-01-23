/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

export class TokenUpdateDto {
    userId: Types.ObjectId;
    token: string;
    tokenTwo: string;
}
