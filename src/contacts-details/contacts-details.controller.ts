/* eslint-disable prettier/prettier */
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import * as Joi from "joi";
import { ContactsDetailsService } from './contacts-details.service';
import { CreateContactsDetailDto } from './dto/create-contacts-detail.dto';
import { UpdateContactsDetailDto } from './dto/update-contacts-detail.dto';

@Controller('contacts-details')
export class ContactsDetailsController {
  constructor(private readonly contactsDetailsService: ContactsDetailsService) { }

  @Post()
  create(@Body() createContactsDetailDto: CreateContactsDetailDto) {
    const contactDetailsSchemaValidation = Joi.object({
      clientName: Joi.string().required().min(2).max(20),
      contactNumber: Joi.string().required().pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/),
      contactEmail: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
      message: Joi.string().required(),
    });
    /***_______  Validation   ________**/
    const { error, value } = contactDetailsSchemaValidation.validate(createContactsDetailDto);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }
    return this.contactsDetailsService.create(value);
  }
  @Get('pagination')
  async contactUsPagination(@Query() querySting) {
    if (!querySting?.skip || !querySting?.limit)
      throw new BadRequestException();
    const skip = +querySting?.skip || 0;
    const limit = +querySting?.limit || 3;

    // return this.blogsService.getPosts(pageNo, limit);
    return this.contactsDetailsService.contactUsPagination(limit, skip);
  }
  @Get()
  findAll() {
    return this.contactsDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactsDetailDto: UpdateContactsDetailDto) {
    return this.contactsDetailsService.update(+id, updateContactsDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsDetailsService.remove(id);
  }
}
