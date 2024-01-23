/* eslint-disable prettier/prettier */
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
    constructor(private readonly mailService: MailerService) { }
    async sendMailFun(to: string, subject: string, text: string) {
        this.mailService.sendMail({
            to,
            subject,
            text,
            html: text
        });
    }
}