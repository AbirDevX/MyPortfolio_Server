/* eslint-disable prettier/prettier */
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as Joi from 'joi';
import { Model, ObjectId } from 'mongoose';
import { ClientsService } from '../clients/clients.service';
import { Client, ClientDocument } from '../clients/schema/client.schema';
import { MailService } from '../mail/mail.service';
import { TokenDocument, Tokens } from './schema/token.schema';
import { TokenService } from './token.service';


@Injectable()
export class AuthService {
    constructor(private readonly clientService: ClientsService, private readonly tokenService: TokenService, private readonly mailService: MailService, @InjectModel(Tokens.name) private readonly tokenModel: Model<TokenDocument>, @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>) { }

    /***_______  SingIn   ________**/

    async signIn(userName: string, pw: string) {
        const signInSchema = Joi.object({
            userName: Joi.string().required(),
            pw: Joi.string().required(),
        });
        /***_______  Validation   ________**/

        const { error, value } = signInSchema.validate({ userName, pw });
        if (error) throw new BadRequestException(error?.message);
        try {
            const client = await this.clientService.findOne(userName);
            if (!client) throw new HttpException("Client Not Found", HttpStatus.NOT_FOUND);

            const isValid = await bcrypt.compare(pw, client.password);
            if (!isValid) throw new BadRequestException();

            // generate tokens
            const { accessToken, refreshToken } = await this.tokenService.generateToken({ _id: client._id, role: client.role });
            // save the refresh token to DB
            const data = await this.tokenService.create({ userId: client._id, token: refreshToken, tokenTwo: accessToken }, client._id);
            // await this.mailService.sendMailFun(userName, "Login", "Login Was Successfull!",);
            return { accessToken, refreshToken };
        } catch (err) {
            console.log(err?.message)
            throw new HttpException(err?.message, err?.status);
            ;
        }
    }
    /***_______  SignOut   ________**/

    async signOut(id: ObjectId) {
        try {
            // const client = await this.clientModel.findById(id);
            // if (!client) throw new InternalServerErrorException();

            // const token = await this.tokenModel.findOne({ userId: client._id });
            // if (!token) throw new InternalServerErrorException("token not found!");

            // const deletedToken = await this.tokenService.remove(token._id);
            // if (!deletedToken) throw new InternalServerErrorException();
            // return deletedToken;
        } catch (error) {
            console.log(error?.message, "Geting error to attpented logout..!");
            throw new InternalServerErrorException();
        }
    }
}
