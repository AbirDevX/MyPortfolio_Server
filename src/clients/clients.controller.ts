/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ClientGuard } from './client.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { HttpExceptionFilter } from './httpExceptionFilter/exceptionFilter';

@Controller('clients')
@UseFilters(HttpExceptionFilter)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('/reg')
  async create(@Body() createClient: CreateClientDto) {
    return await this.clientsService.create(createClient);
  }
  @Get('pagination')
  @UseGuards(ClientGuard)
  async getBlogWithPagination(@Query() querySting) {
    if (!querySting?.skip || !querySting?.limit)
      throw new BadRequestException();
    const skip = +querySting?.skip || 0;
    const limit = +querySting?.limit || 3;

    // return this.blogsService.getPosts(pageNo, limit);
    return this.clientsService.clientPagination(limit, skip);
  }
  @Get()
  @UseGuards(ClientGuard)
  async findAll(@Request() req: Request) {
    try {
      if (req.headers['authorization']) {
        if (req.headers['authorization'].split(' ').length < 3)
          throw new BadRequestException();
      }
      // console.log(req.headers["authorization"].split(" ").length);
      return await this.clientsService.findAll();
    } catch (error) {
      throw new BadRequestException();
    }
  }
  @Get(':id')
  @UseGuards(ClientGuard)
  async findOne(@Param('id') id: string) {
    return await this.clientsService.findOne(id);
  }
}
