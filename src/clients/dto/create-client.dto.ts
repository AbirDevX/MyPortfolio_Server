/* eslint-disable prettier/prettier */
export class CreateClientDto {
    firstName: string;
    lastName: string;
    number: string;
    email: string;
    password: string;
    cPassword: string;
    avatar?: string;
    role: string;
}
