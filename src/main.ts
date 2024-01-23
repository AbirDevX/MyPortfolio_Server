/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

const cookieParser = require('cookie-parser');
const morgan = require('morgan');

import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './clients/httpExceptionFilter/exceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({origin: [
    'https://abirsantraonline.netlify.app',
    'https://abirsantraonline.vercel.app',
    'http://localhost:3000',],
    credentials: true,
  });

  // if (process.env.NODE_ENV === "development") {
  app.useStaticAssets(join(__dirname, '..', '/src/public')); // Specify the path to the static folder
  // } else {
  app.useStaticAssets(join(__dirname, '..', '/dist/public')); // Specify the path to the static folder
  // }
  console.log(
    `====================== Hey Welcome TO ${process.env.NODE_ENV} ======================`,
  );
  app.use(morgan('dev')); // Specify the desired log format ('combined' in this example)
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  await app.listen(process.env.PORT || 8080);
}

bootstrap();
