/* eslint-disable prettier/prettier */
import { NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        next();
    }
}