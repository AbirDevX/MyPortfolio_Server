/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../clients/schema/client.schema';
import { MailService } from '../mail/mail.service';
import { Otp, OtpDocument } from './schema/otp.schema';
import { TokenService } from './token.service';

Injectable();
export class ResetPasswordService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}
  /*==============GENERATE-OTP================*/
  async generateOtp() {
    const otp = crypto.randomInt(100000, 999999);
    return otp;
  }
  /*==============SAVE-OTP================*/
  async saveOtp(otp: string, userName: string) {
    try {
      const client = await this.clientModel.findOne({
        $or: [{ email: userName }, { number: userName }],
      });
      if (!client) throw new NotFoundException('User was not found!');

      const validTime = 1000 * 60 * 2; // 2min
      const expiresIn = Date.now() + validTime;
      const haveClient = await this.otpModel.findOne({ userId: client._id });
      const hashData = await this.tokenService.hashData(otp);
      const hashOtp = `${hashData}.${expiresIn}`;
      if (haveClient) {
        const updateOtp = await this.otpModel.findOneAndUpdate(
          { userId: client._id },
          { otp: hashOtp, isVerified: false },
          { new: true },
        );
        // send via Email
        // console.log(otp)
        await this.mailService.sendMailFun(
          userName,
          'Rcovery Passwrod',
          `Your Reset Password OTP IS : <b>${otp}</b>`,
        );

        /***_______  send response   ________**/

        return {
          OTP: updateOtp.otp.split('.')[0],
          msg: 'You should recive a email from us.',
        };
      } else {
        const model = new this.otpModel({
          userId: client._id,
          otp: hashOtp,
          isVerified: false,
        });
        const newOtp = await model.save();
        // send via Email
        await this.mailService.sendMailFun(
          userName,
          'Rcovery Passwrod',
          `Your Reset Password OTP IS : <b>${otp}</b>`,
        );

        /***_______  send response   ________**/

        return {
          OTP: newOtp.otp.split('.')[0],
          msg: 'You should recive a email from us.',
        };
      }
    } catch (error) {
      if (error?.status === 404) {
        throw new NotFoundException(error?.message);
      } else {
        throw new InternalServerErrorException(error?.message);
      }
    }
  }
  /*==============VERIFY-OTP================*/
  async verifyOtp(email: string, otp: string) {
    try {
      const client = await this.clientModel.findOne({ email });
      if (!client) throw new NotFoundException('client was not found!');
      const otpData = await this.otpModel.findOne({ userId: client._id });
      if (!otpData) throw new NotFoundException('otp not found!');
      // convert otp to number
      const [hashOtpFromDB, expireTime] = otpData.otp.split('.');
      const hashOtpFromClient = await this.tokenService.hashData(otp);
      if (hashOtpFromClient !== hashOtpFromDB)
        throw new BadRequestException('OTP was invalid!');
      if (Date.now() > +expireTime)
        throw new BadRequestException('OTP was expired!');
      const tokenPayload = { _id: otpData._id, userId: otpData.userId };
      const token = await this.tokenService.generateOtpToken(tokenPayload);
      return { message: 'SUCCESS', token };
    } catch (error) {
      if (error?.status === 404) {
        throw new NotFoundException(error?.message);
      } else if (error?.status === 400) {
        console.log(error.message);
        throw new BadRequestException(error?.message);
      } else {
        throw new InternalServerErrorException(error?.message);
      }
    }
  }
}
