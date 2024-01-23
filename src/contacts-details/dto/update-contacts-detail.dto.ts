/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateContactsDetailDto } from './create-contacts-detail.dto';

export class UpdateContactsDetailDto extends PartialType(CreateContactsDetailDto) { }
