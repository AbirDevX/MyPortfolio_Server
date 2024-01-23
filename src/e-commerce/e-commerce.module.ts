import { Module } from '@nestjs/common';
import { ECommerceService } from './e-commerce.service';
import { ECommerceController } from './e-commerce.controller';
import { ProductsModule } from './products/products.module';

@Module({
  controllers: [ECommerceController],
  providers: [ECommerceService],
  imports: [ProductsModule]
})
export class ECommerceModule {}
