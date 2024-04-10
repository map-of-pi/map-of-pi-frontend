import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { ShopService } from './shop.service';

describe('ShopService', () => {
  let service: ShopService;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(() => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    });
    service = TestBed.inject(ShopService);
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
