/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContactsDetailDto } from './dto/create-contacts-detail.dto';
import { UpdateContactsDetailDto } from './dto/update-contacts-detail.dto';
import {
  ContactsDetails,
  ContactsDetailsDocument,
} from './schema/contacts-detail.schema';

@Injectable()
export class ContactsDetailsService {
  constructor(
    @InjectModel(ContactsDetails.name)
    private readonly contactDetailsModel: Model<ContactsDetailsDocument>,
  ) {}
  async create(payload: CreateContactsDetailDto) {
    try {
      const model = new this.contactDetailsModel();
      model.clientName = payload.clientName;
      model.contactEmail = payload.contactEmail;
      model.contactNumber = payload.contactNumber;
      model.message = payload.message;
      const data = await model.save();
      return data;
    } catch (error) {
      if (error?.status === 400) {
        throw new BadRequestException(error?.message);
      } else {
        throw new InternalServerErrorException(error?.message);
      }
    }
  }

  async findAll() {
    try {
      const data = await this.contactDetailsModel.find();
      return data;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async contactUsPagination(limit: number, skip: number) {
    try {
      const result = await this.contactDetailsModel.aggregate([
        { $skip: skip },
        { $limit: limit },
      ]);
      if (!result) throw new BadRequestException();
      return result;
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} contactsDetail`;
  }

  update(id: number, updateContactsDetailDto: UpdateContactsDetailDto) {
    return `This action updates a #${id} contactsDetail`;
  }

  async remove(id: string) {
    try {
      await this.contactDetailsModel.findByIdAndDelete(id);
      return;
    } catch (error) {
      console.log(error?.message);
      if (error?.status === 400) {
        throw new BadRequestException(error?.message);
      } else {
        throw new InternalServerErrorException(error?.message);
      }
    }
  }
}
