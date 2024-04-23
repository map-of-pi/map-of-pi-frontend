import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { LoyaltyProgramComponent } from './loyalty-program.component';

describe('LoyaltyProgramComponent', () => {
  let component: LoyaltyProgramComponent;
  let fixture: ComponentFixture<LoyaltyProgramComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [LoyaltyProgramComponent],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyProgramComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
