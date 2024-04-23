import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { CurrentUserService } from './current-user.service';

describe('CurrentUserService', () => {
  let service: CurrentUserService;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(() => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    });
    service = TestBed.inject(CurrentUserService);
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
