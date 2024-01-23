/* eslint-disable prettier/prettier */
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { ClientsModule } from './clients/clients.module';
import { ContactsDetailsModule } from './contacts-details/contacts-details.module';
import { ECommerceModule } from './e-commerce/e-commerce.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return { uri: configService.get<string>('MONGO_DB_URL') };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        // secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PW,
        },
      },
    }),
    ClientsModule,
    AuthModule,
    MailModule,
    MailModule,
    BlogsModule,
    ContactsDetailsModule,
    ECommerceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('welcome to app module....');
  }
}
