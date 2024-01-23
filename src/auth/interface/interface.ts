/* eslint-disable prettier/prettier */
import { Types } from 'mongoose';

export interface IrefreshToken {
    userId: Types.ObjectId;
    token: string;
    tokenTwo: string
}

export interface IOtp {
    userId: Types.ObjectId;
    otp: string;
    isVerified: boolean;
}


export interface Itoken {
    _id: Types.ObjectId;
    role: string;
}

export interface IsendOtpPayload {
    userName: string;
}

export interface IotpPayload {
    otp: string;
    email: string;
}


export interface IjwtOtpPaylod {
    expireTime: number;
};

export interface IResetPWPayload {
    password: string;
    cPassword: string;
}

export interface IQueryPayload {
    email: string;
}