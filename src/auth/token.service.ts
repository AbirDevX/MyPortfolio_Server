/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Request } from 'express';
import * as Joi from 'joi';
import { Model, ObjectId, Types } from 'mongoose';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/schema/client.schema';
import { TokenUpdateDto } from './dto/toke.update.dto';
import { IrefreshToken, Itoken } from './interface/interface';
import { TokenDocument, Tokens } from './schema/token.schema';

interface IPayload {
  _id: Types.ObjectId;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Tokens.name) private readonly tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService,
    private readonly clientService: ClientsService,
  ) {}

  /*==============generate access token & refresh token================*/

  async generateToken(payload: IPayload) {
    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '24h',
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '1y',
      });
      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
  /*==============TOKEN-FOR_OTP================*/

  async generateOtpToken(payload: any) {
    try {
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.OTP_SECRET,
        expiresIn: '5min',
      });

      return token;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
  /*==============VERIFY-TOKEN-FOR_OTP================*/

  async verifyOtpToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {secret: process.env.OTP_SECRET})

      return decoded;
    } catch (error) {
      return false;
    }
  }
  /*==============create Refresh token and save to DB================*/

  async create(payload: IrefreshToken, userId: Types.ObjectId) {
    const tokenValidationSchema = Joi.object({
      userId: Joi.required(),
      token: Joi.string().required(),
      tokenTwo: Joi.string().required(),
    });
    const { error, value } = tokenValidationSchema.validate(payload);
    if (error) throw new BadRequestException(error.details[0].message);
    try {
      const client = await this.tokenModel.findOne({ userId: userId });
      if (!client) {
        const model = new this.tokenModel();
        model.userId = payload.userId;
        model.token = payload.token;
        model.tokenTwo = payload.tokenTwo;
        const data = await model.save();
        return data;
      } else {
        const token = await this.tokenModel.findOneAndUpdate(
          { userId },
          { token: payload.token, tokenTwo: payload.tokenTwo },
          { new: true },
        );
        return token;
      }
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  /***_______  Regenerate Access token with the help of refresh token   ________**/

  async refreshToken(refreshToken: string) {
    let decodedClient: Itoken;
    try {
      decodedClient = await this.verifyRefreshToken(refreshToken);
      if (!decodedClient) throw new UnauthorizedException();
    } catch (error) {
      // console.log(refreshToken)
      console.log(error?.message, 'verify refreshtoken failed');
      throw new UnauthorizedException();
    }

    /***_______  Find Client  on DB   ________**/

    let validClient: Client | null;
    try {
      validClient = await this.clientService.findOneById(decodedClient._id);
      if (!validClient) throw new NotFoundException();
    } catch (error) {
      console.log(error?.message);
      throw new InternalServerErrorException(error?.message);
    }

    let token: string | Tokens | any;
    try {
      token = await this.tokenModel.findOne({ userId: validClient._id });
    } catch (error) {
      throw new NotFoundException();
    }

    /***_______  Generate Update the refresh token    ________**/
    try {
      const { refreshToken, accessToken } = await this.generateToken({
        _id: validClient._id,
        role: validClient.role,
      });

      // update the token
      const response = await this.update(token._id, {
        userId: validClient._id,
        token: refreshToken,
        tokenTwo: accessToken,
      });
      return { refreshToken: response.token, accessToken: response.tokenTwo };
    } catch (error) {
      console.log(error?.message);
      throw new InternalServerErrorException(error?.message);
    }
  }

  /***_______  verify Refresh Token   ________**/

  async verifyRefreshToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
  }
  /***_______  verify Access Token   ________**/

  async verifyAccessToken(token: string) {
    try {
      const ValidToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      if (!ValidToken) throw new UnauthorizedException();
      ValidToken.isvalid = true;
      return ValidToken;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async findAll() {
    return `find all!`;
  }

  /***_______  find single token    ________**/

  async findOne(id: string) {
    try {
      const data = await this.tokenModel.findById(id).populate('userId').exec();
      return data;
    } catch (error) {
      console.log(error?.message);
      throw new NotFoundException();
    }
  }

  /***_______  Find One Via userId   ________**/

  async findOneByUserId(id: ObjectId) {
    try {
      const data = await this.tokenModel.findOne({ userId: id });
      if (!data) throw new InternalServerErrorException();
      return data;
    } catch (error) {
      console.log(error?.message);
      throw new NotFoundException();
    }
  }

  /***_______  Update token   ________**/

  update(id: ObjectId, tokenUpdateDto: TokenUpdateDto) {
    // console.log(tokenUpdateDto)
    return this.tokenModel.findByIdAndUpdate(id, tokenUpdateDto, { new: true });
  }

  /***_______  remove token   ________**/

  async remove(id: ObjectId) {
    return await this.tokenModel.findByIdAndDelete(id);
  }
  async hashData(data: string) {
    const hash = crypto
      .createHmac('sha256', process.env.OTP_SECRET)
      .update(data.toString())
      .digest('hex');
    return hash;
  }
  /***_______  extract Bearer Token   ________**/

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, accessToken, refreshToken] =
      request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? accessToken : undefined;
  }
}
