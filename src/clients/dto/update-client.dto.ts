/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    number?: string;
}

