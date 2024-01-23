/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as Jimp from 'jimp';
import * as Joi from 'joi';
import mongoose, { Model, Types } from 'mongoose';
import { join } from 'path';
import { UtilityService } from '../utility/utility.service';
import { ClientDto } from './dto/clientDto';
import { CreateClientDto } from './dto/create-client.dto';
import { ResetPwDto } from './dto/resetPw-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { IHashPassword, UserRole } from './interface/interface';
import { Client, ClientDocument } from './schema/client.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    private readonly utilityService: UtilityService,
  ) {}

  async create(createClient: CreateClientDto) {
    // Add Validation

    const addClientSchema = Joi.object({
      firstName: Joi.string().required().min(2).max(20),
      lastName: Joi.string().required().min(2).max(20),
      number: Joi.string()
        .required()
        .pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/),
      email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
      }),
      password: Joi.string().min(8).max(20).required(),
      cPassword: Joi.string()
        .min(8)
        .max(20)
        .required()
        .valid(Joi.ref('password')),
    });

    const { error, value } = addClientSchema.validate(createClient);
    if (error) {
      // console.log(error)
      throw new BadRequestException(error.details[0].message);
    }

    /***_______ Check email and number is unique    ________**/

    try {
      const isExist = await this.checkEmailAndNumberAlreadyExist(
        createClient.email,
        createClient.number,
      );

      if (isExist && isExist.email === createClient.email)
        throw new BadRequestException('email already exits.');
      if (isExist && isExist.number === createClient.number)
        throw new BadRequestException('number already exits.');
    } catch (err) {
      console.log(err?.message);
      throw new BadRequestException(err?.message);
    }
    /***_______  Hashing Password    ________**/

    try {
      const { hashPassword, hashcPassword } = await this.hashPassword({
        cPassword: createClient.cPassword,
        password: createClient.password,
      });

      /***_______     ________**/
      const newClient = await this.save(createClient, {
        hashcPassword,
        hashPassword,
      });

      // final response
      return new ClientDto(newClient);
    } catch (error) {
      console.log(error?.message);
      throw new InternalServerErrorException(error?.message);
    }
  }

  async findAll() {
    try {
      const allClient: Client[] = await this.clientModel.find();
      if (allClient.length === 0) throw new NotFoundException();
      const saniteaseResponse = allClient.map((value: ClientDocument) => {
        return new ClientDto(value);
      });
      return saniteaseResponse;
    } catch (error) {
      if (error?.status === 404) {
        throw new NotFoundException(error?.message);
      } else {
        throw new InternalServerErrorException(error?.message);
      }
    }
  }

  async findOne(id: string) {
    try {
      const client = await this.clientModel.findOne({
        $or: [{ email: id }, { number: id }],
      });
      if (!client) throw new NotFoundException('client not found!');
      return client;
    } catch (err) {
      console.log(err?.message);
      if (err?.status === 404) {
        throw new NotFoundException(err?.message);
      } else {
        throw new InternalServerErrorException(err?.message);
      }
    }
  }
  async findOneById(id: Types.ObjectId) {
    try {
      const client = await this.clientModel.findById(id);
      if (!client) throw new NotFoundException('client not found!');
      return client;
    } catch (err) {
      console.log(err?.message);
      if (err?.status === 404) {
        throw new NotFoundException(err?.message);
      } else {
        throw new InternalServerErrorException(err?.message);
      }
    }
  }
  async findById(id: Types.ObjectId) {
    try {
      const client = await this.clientModel.findById(id);
      if (!client) throw new NotFoundException('client not found!');
      return new ClientDto(client);
    } catch (err) {
      console.log(err?.message);
      if (err?.status === 404) {
        throw new NotFoundException(err?.message);
      } else {
        throw new InternalServerErrorException(err?.message);
      }
    }
  }

  async resetPwupdate(id: string, resetPwDto: ResetPwDto) {
    try {
      const newHashPassword = await this.hashPassword(resetPwDto);
      const client = await this.clientModel.findOne({ email: id });
      const samePw = await bcrypt.compare(resetPwDto.password, client.password);
      if (samePw)
        throw new BadRequestException(
          'Current password & old password should not same..!',
        );
      await this.clientModel.findOneAndUpdate(
        { email: id },
        {
          password: newHashPassword.hashPassword,
          cPasword: newHashPassword.hashcPassword,
        },
        { new: true },
      );
      return 'SUCCESS';
    } catch (error: any) {
      console.log(error?.message);
      if (error?.response?.statusCode === 400) {
        throw new BadRequestException(
          'Current password & old password should not same..!',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    let imagePath;
    try {
      const mongooseID = new mongoose.Types.ObjectId(id);

      const rowBase = updateClientDto.avatar.split(',');
      // console.log(rowBase.length, )
      if (rowBase.length > 1) {
        // console.log(rowBase.length)
        const have = await this.clientModel.findById(mongooseID);
        if (have) {
          if (process.env.NODE_ENV === 'development') {
            await this.utilityService.toDeleteFile(
              `./src/public/uploads/${have.avatar.split('/').reverse()[0]}`,
            );
          } else {
            await this.utilityService.toDeleteFile(
              `./dist/public/uploads/${have.avatar.split('/').reverse()[0]}`,
            );
          }
        }

        const buffer = Buffer.from(rowBase[1], 'base64');
        const compressData = await Jimp.read(buffer);

        /***_______Create Image Path________**/

        imagePath = `${Date.now()}_${Math.round(Math.random() * 1e9)}.png`;

        /***_______Compress Image________**/
        if (process.env.NODE_ENV === 'development') {
          await compressData
            .resize(150, Jimp.AUTO)
            .write(
              join(__dirname, '../..', `/src/public/uploads/${imagePath}`),
            );
        } else {
          await compressData
            .resize(150, Jimp.AUTO)
            .write(
              join(__dirname, '../..', `/dist/public/uploads/${imagePath}`),
            );
        }
      }

      const updatedClient = await this.clientModel.findByIdAndUpdate(
        mongooseID,
        { ...updateClientDto, avatar: imagePath },
        { new: true },
      );
      return new ClientDto(updatedClient);
    } catch (error) {
      console.log(error);
      if (process.env.NODE_ENV === 'development') {
        await this.utilityService.toDeleteFile(
          `./src/public/uploads/${imagePath}`,
        );
      } else {
        await this.utilityService.toDeleteFile(
          `./dist/public/uploads/${imagePath}`,
        );
      }

      if (error.status === 400) {
        throw new BadRequestException();
      } else if (error.status === 401) {
        throw new UnauthorizedException();
      } else if (error?.code === 11000) {
        const msg = error?.keyValue?.email ? 'email' : 'number';
        throw new BadRequestException(`${msg}`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async hashPassword(para: IHashPassword) {
    try {
      const saltOrRounds = 10;
      const password = para.password;
      const cPassword = para.cPassword;

      const hashPassword = await bcrypt.hash(password, saltOrRounds);
      const hashcPassword = await bcrypt.hash(cPassword, saltOrRounds);
      if (password !== cPassword)
        throw new BadRequestException('Both Password are not same!');
      return { hashPassword, hashcPassword };
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async checkEmailAndNumberAlreadyExist(email: string, number: string) {
    return this.clientModel.findOne({ $or: [{ email }, { number }] });
  }

  async save(
    createClient: CreateClientDto,
    hashingPassword: { hashPassword: string; hashcPassword: string },
  ) {
    try {
      const model = new this.clientModel();
      model.firstName = createClient.firstName;
      model.lastName = createClient.lastName;
      model.email = createClient.email;
      model.number = createClient.number;
      model.password = hashingPassword.hashPassword;
      model.cPassword = hashingPassword.hashcPassword;
      if (
        createClient.number === '9064749861' &&
        createClient.email === 'abirrens@gmail.com'
      ) {
        model.role = UserRole.ADMIN;
      } else {
        model.role = UserRole.USER;
      }
      const data = await model.save();
      return data;
    } catch (err) {
      console.log(err?.message);
      throw new InternalServerErrorException(err?.message);
    }
  }
  async clientPagination(limit: number, skip: number) {
    try {
      const result = await this.clientModel.aggregate([
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            password: 0,
            blogIds: 0,
            likedBlog: 0,
            likedComment: 0,
            likedReply: 0,
            cPassword: 0,
          },
        },
      ]);
      if (!result) throw new BadRequestException();
      return result;
    } catch (error) {
      console.log(error);
      if (error.status === 404) throw new NotFoundException();
      throw new InternalServerErrorException();
    }
  }
}
