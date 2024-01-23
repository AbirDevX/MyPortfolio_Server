/* eslint-disable prettier/prettier */

import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";



interface IToken {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CommentsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req: Request = context.switchToHttp().getRequest();
    if (!req.headers.authorization) throw new BadRequestException();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new BadRequestException();
    }
    try {
      const decodedPayload = await this.jwtService.verifyAsync(
        token.accessToken,
        { secret: process.env.ACCESS_TOKEN_SECRET },
      );
      req['user'] = decodedPayload;
      // console.log(decodedPayload)
    } catch (error) {
      console.log(error.message);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): IToken | undefined {
    const [type, accessToken, refreshToken] =
      request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? { accessToken, refreshToken } : undefined;
  }
}
