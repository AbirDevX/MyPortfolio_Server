import { Injectable } from '@nestjs/common';
import { CreateECommerceDto } from './dto/create-e-commerce.dto';
import { UpdateECommerceDto } from './dto/update-e-commerce.dto';

@Injectable()
export class ECommerceService {
  create(createECommerceDto: CreateECommerceDto) {
    return 'This action adds a new eCommerce';
  }

  findAll() {
    return `This action returns all eCommerce`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eCommerce`;
  }

  update(id: number, updateECommerceDto: UpdateECommerceDto) {
    return `This action updates a #${id} eCommerce`;
  }

  remove(id: number) {
    return `This action removes a #${id} eCommerce`;
  }
}
