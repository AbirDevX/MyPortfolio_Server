/* eslint-disable prettier/prettier */
import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, } from "express";
import mongoose from "mongoose";
import { ClientsService } from "../clients/clients.service";
import { TokenService } from "./token.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly clientService: ClientsService, private readonly tokenService: TokenService) { }
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
            const id = new mongoose.Types.ObjectId(`${req.params.id}`);
            const client = await this.clientService.findOneById(id);
            const tokenDb = await this.tokenService.findOneByUserId(client._id);
            const decodedPayload = await this.jwtService.verifyAsync(tokenDb.tokenTwo, { secret: process.env.ACCESS_TOKEN_SECRET });
            req['user'] = decodedPayload;
        } catch (error) {
            throw new UnauthorizedException();
        }
        return true
    };

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    };
};