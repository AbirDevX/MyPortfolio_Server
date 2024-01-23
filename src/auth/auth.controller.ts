/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, InternalServerErrorException, Param, Patch, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from "express";
import * as Joi from 'joi';
import mongoose from 'mongoose';
import { ClientsService } from '../clients/clients.service';
import { IupdateClientPayload } from '../clients/interface/interface';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private tokenService: TokenService, private readonly clientService: ClientsService) { }
    @HttpCode(200)
    @Post('login')
    async logIn(@Body() signInDto: SignInDto, @Res() res: Response) {
        const response = await this.authService.signIn(signInDto.userName, signInDto.pw)
        // 1 mounth
        res.cookie("abirsantraOnline_accessToken", response.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
        // 1 year
        res.cookie("abirsantraOnline_refreshToken", response.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 * 12 });
        res.json(response);
    };

    @Get('auto-login')
    async refreshToken(@Req() req: Request, @Res() res: Response) {
        if (!req.headers.authorization) throw new BadRequestException();

        const [type, accessToken, refreshToken] = req.headers.authorization.split(" ") ?? [];
        if (!refreshToken) throw new BadRequestException();
        try {
            const response = await this.tokenService.refreshToken(refreshToken);

            res.cookie(process.env.COOKIE_ACCESS_TOKEN_NAME as string, response.accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
            res.cookie(process.env.COOKIE_REFRESH_TOKEN_NAME as string, response.refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 });

            res.status(200).json(response);
        } catch (error) {
            // console.log(error?.message, 'controller')
            if (error.status === 401) {
                throw new UnauthorizedException();
            } else {
                throw new InternalServerErrorException();
            }
        }
    };

    @Get(':id')
    async findOne(@Param() param: { id: string }) {
        try {
            const token = await this.tokenService.findOne(param.id);
            return token;
        } catch (error) {
            console.log(error?.message);
            throw new InternalServerErrorException(error?.message);
        }
    };

    @Get()
    @UseGuards(AuthGuard)
    findAll(@Req() req: Request) {
        // console.log(req['user']);
        return "hello world!"
    }


    @Delete("/signOut/:id")
    @UseGuards(AuthGuard)
    async signOut(@Param() param, @Req() req: Request, @Res() res: Response) {
        const decodedUser = req["user"];
        try {
            // const data = await this.authService.signOut(param.id);
            res.clearCookie(process.env.COOKIE_REFRESH_TOKEN_NAME as string, { httpOnly: true });
            res.clearCookie(process.env.COOKIE_ACCESS_TOKEN_NAME as string, { httpOnly: true });
            res.status(200).json({ msg: "LogOut Successfull.." });
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    // get Client with guard

    @Get('/client/:id')
    @UseGuards(AuthGuard)
    async findOneById(@Param('id') id: string) {
        const mongooseId = new mongoose.Types.ObjectId(id);
        return await this.clientService.findById(mongooseId)
    }

    // update client
    @Patch("/client/:id")
    @UseGuards(AuthGuard)
    async updateClientById(@Body() reqBody: IupdateClientPayload, @Param() param: { id: string }) {
        const updateClientSchema = Joi.object({
            firstName: Joi.string().required().alphanum().min(2).max(20),
            lastName: Joi.string().required().alphanum().min(2).max(20),
            number: Joi.string().required().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/),
            email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            avatar: Joi.string()
        });
        /***_______  Validation   ________**/
        const { error, value } = updateClientSchema.validate(reqBody);
        if (error) {
            throw new BadRequestException(error.details[0].message);
        }
        return await this.clientService.update(param.id, value);
    }

}
