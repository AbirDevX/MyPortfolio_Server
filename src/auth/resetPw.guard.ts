/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ClientsService } from '../clients/clients.service';
import { TokenService } from './token.service';

@Injectable()
export class ResetPwGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clientService: ClientsService,
    private readonly tokenService: TokenService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req: Request = context.switchToHttp().getRequest();
    // const accessToken = req.cookies[process.env.COOKIE_ACCESS_TOKEN_NAME as string];
    if (!req.headers.authorization) throw new BadRequestException();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new BadRequestException();
    }
    try {
      // convert to objectId to string
      const decoded = await this.tokenService.verifyOtpToken(token);
      if (!decoded) throw new UnauthorizedException('Token may be expire? re-try again.');
    } catch (error) {
      console.log(error);
      if (error?.status === 401) {
        throw new UnauthorizedException('Token may be expire?');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
