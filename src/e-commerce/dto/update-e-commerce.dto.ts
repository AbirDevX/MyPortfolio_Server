import { PartialType } from '@nestjs/mapped-types';
import { CreateECommerceDto } from './create-e-commerce.dto';

export class UpdateECommerceDto extends PartialType(CreateECommerceDto) {}
