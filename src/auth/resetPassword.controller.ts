/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ClientsService } from '../clients/clients.service';
import {
  IQueryPayload,
  IResetPWPayload,
  IotpPayload,
  IsendOtpPayload,
} from './interface/interface';
import { ResetPasswordService } from './resetPassword.service';
import { ResetPwGuard } from './resetPw.guard';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly resetOtpService: ResetPasswordService,
    private readonly clientService: ClientsService,
  ) {}
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() reqBody: IsendOtpPayload) {
    const validateObjectSchema = Joi.object({
      userName: Joi.string().required(),
    });
    const { error } = validateObjectSchema.validate(reqBody);
    if (error) throw new BadRequestException(error.details[0].message);
    const otp = await this.resetOtpService.generateOtp();
    return await this.resetOtpService.saveOtp(`${otp}`, reqBody.userName);
  }
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() reqBody: IotpPayload) {
    const validateObjectSchema = Joi.object({
      otp: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    const { error } = validateObjectSchema.validate(reqBody);
    if (error) throw new BadRequestException(error.details[0].message);
    return await this.resetOtpService.verifyOtp(reqBody.email, reqBody.otp);
  }
  @Patch()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ResetPwGuard)
  async resetPassword(
    @Body() body: IResetPWPayload,
    @Query() query: IQueryPayload, 
  ) {
    const validateObjectSchema = Joi.object({
      password: Joi.string().required(),
      cPassword: Joi.string().required(),
    });
    const { error, value } = validateObjectSchema.validate(body);
    if (error) throw new BadRequestException(error.details[0].message);
    if (!query.email) throw new BadRequestException();
    if (body.cPassword !== body.password) throw new BadRequestException();
    return await this.clientService.resetPwupdate(query.email, value);
  }
}
