/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '../clients/clients.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { TokenSchema, Tokens } from './schema/token.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../clients/schema/client.schema';
import { MailModule } from '../mail/mail.module';
import { ResetPasswordController } from './resetPassword.controller';
import { ResetPasswordService } from './resetPassword.service';
import { Otp, OtpSchema } from './schema/otp.schema';
import { TokenSchema, Tokens } from './schema/token.schema';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';

@Module({
  imports: [
    ClientsModule,
    MailModule,
    // import token model
    MongooseModule.forFeature([
      { name: Tokens.name, schema: TokenSchema },
      { name: Otp.name, schema: OtpSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    // Access Token
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET as string,
      signOptions: { expiresIn: '30min' },
    }),
    // refresh Token
    JwtModule.register({
      global: true,
      secret: process.env.REFRESH_TOKEN_SECRET as string,
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [AuthController, TokenController, ResetPasswordController],
  providers: [AuthService, TokenService, ResetPasswordService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
