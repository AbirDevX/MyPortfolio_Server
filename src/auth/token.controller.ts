/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientsService } from '../clients/clients.service';
import { ClientDto } from '../clients/dto/clientDto';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(
    private tokenService: TokenService,
    private clientService: ClientsService,
  ) {}

  /***_______ Verify the access toke of Client    ________**/

  @Get('verify-token-client/:id')
  async verifyClientToken(
    @Req() req: Request,
    @Res() res: Response,
    @Param() para,
  ) {
    // const refreshToken = req.cookies["refreshToken"];

    /***_______  Cookie approceh is not working parfectfy that why going though classic approch   ________**/

    try {
      if (!req.headers.authorization) throw new BadRequestException();
      const accessToken = this.tokenService.extractTokenFromHeader(req);

      const client = await this.clientService.findOneById(para.id);
      if (!client) throw new InternalServerErrorException();
      const token = await this.tokenService.findOneByUserId(client._id);
      if (!token) throw new InternalServerErrorException();

      const validAccessToken = await this.tokenService.verifyAccessToken(token.tokenTwo,);
      // console.log(validAccessToken);
      
      if (!validAccessToken || !validAccessToken.isvalid)
        throw new UnauthorizedException();

      res.cookie(
        process.env.COOKIE_ACCESS_TOKEN_NAME,
        validAccessToken.accessToken,
        { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 },
      );
      // // 1 year
      res.cookie(
        process.env.COOKIE_REFRESH_TOKEN_NAME,
        validAccessToken.refreshToken,
        { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      res
        .status(200)
        .json({
          msg: true,
          data: new ClientDto(client),
          accessToken: token.tokenTwo,
          refreshToken: token.token,
        });
    } catch (error) {
      if (error?.status === 401) {
        console.log(error?.message, 'Access Tokes was expired.......!');
        res.status(401).json({ msg: false });
      } else if (error?.status === 500) {
        console.log(error?.message, 'Internal Server Error.......!');
        res.status(500).json({ msg: false });
      } else {
        console.log(error?.message);
        res.status(400).json({ msg: false });
      }
    }
  }
  @Delete(':id')
  async remove(@Param() param) {
    try {
      const deletedToken = await this.tokenService.remove(param.id);
      return deletedToken;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
