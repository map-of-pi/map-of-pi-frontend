import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { OrderProgressComponent } from './order-progress.component';

describe('OrderProgressComponent', () => {
  let component: OrderProgressComponent;
  let fixture: ComponentFixture<OrderProgressComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [OrderProgressComponent],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();
    
    fixture = TestBed.createComponent(OrderProgressComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch order details', () => {
    spyOn(component, 'fetchOrderDetails');
    component.ngOnInit();
    expect(component.fetchOrderDetails).toHaveBeenCalled();
  });

  it('should initialize timer', () => {
    spyOn(component, 'initializeTimer');
    component.ngOnInit();
    expect(component.initializeTimer).toHaveBeenCalled();
  });

  it('should fetch total price', () => {
    spyOn(component, 'fetchTotalPrice');
    component.ngOnInit();
    expect(component.fetchTotalPrice).toHaveBeenCalled();
  });
});
