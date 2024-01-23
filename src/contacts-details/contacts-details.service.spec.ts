import { Test, TestingModule } from '@nestjs/testing';
import { ContactsDetailsService } from './contacts-details.service';

describe('ContactsDetailsService', () => {
  let service: ContactsDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsDetailsService],
    }).compile();

    service = module.get<ContactsDetailsService>(ContactsDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
