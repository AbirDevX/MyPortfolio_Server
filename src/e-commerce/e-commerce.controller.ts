import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ECommerceService } from './e-commerce.service';
import { CreateECommerceDto } from './dto/create-e-commerce.dto';
import { UpdateECommerceDto } from './dto/update-e-commerce.dto';

@Controller('e-commerce')
export class ECommerceController {
  constructor(private readonly eCommerceService: ECommerceService) {}

  @Post()
  create(@Body() createECommerceDto: CreateECommerceDto) {
    return this.eCommerceService.create(createECommerceDto);
  }

  @Get()
  findAll() {
    return this.eCommerceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eCommerceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateECommerceDto: UpdateECommerceDto) {
    return this.eCommerceService.update(+id, updateECommerceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eCommerceService.remove(+id);
  }
}
