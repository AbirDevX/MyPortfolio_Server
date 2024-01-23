import { Test, TestingModule } from '@nestjs/testing';
import { ContactsDetailsController } from './contacts-details.controller';
import { ContactsDetailsService } from './contacts-details.service';

describe('ContactsDetailsController', () => {
  let controller: ContactsDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsDetailsController],
      providers: [ContactsDetailsService],
    }).compile();

    controller = module.get<ContactsDetailsController>(ContactsDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
