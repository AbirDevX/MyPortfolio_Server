import { Test, TestingModule } from '@nestjs/testing';
import { ECommerceController } from './e-commerce.controller';
import { ECommerceService } from './e-commerce.service';

describe('ECommerceController', () => {
  let controller: ECommerceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ECommerceController],
      providers: [ECommerceService],
    }).compile();

    controller = module.get<ECommerceController>(ECommerceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
