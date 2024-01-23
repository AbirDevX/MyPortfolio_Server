/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactsDetailsController } from './contacts-details.controller';
import { ContactsDetailsService } from './contacts-details.service';
import { ContactsDetailSchema, ContactsDetails } from "./schema/contacts-detail.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactsDetails.name, schema: ContactsDetailSchema }]),
  ],
  controllers: [ContactsDetailsController],
  providers: [ContactsDetailsService]
})
export class ContactsDetailsModule { }
