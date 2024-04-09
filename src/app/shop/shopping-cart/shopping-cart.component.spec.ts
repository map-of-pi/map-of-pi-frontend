import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NGXLogger } from 'ngx-logger';
import { ShoppingCartComponent } from './shopping-cart.component';

describe('ShoppingCartComponent', () => {
  let component: ShoppingCartComponent;
  let fixture: ComponentFixture<ShoppingCartComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [ShoppingCartComponent, RouterTestingModule],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingCartComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize order button on ngOnInit', () => {
    spyOn(component, 'setupOrderButton').and.callThrough();
    component.ngOnInit();
    expect(component.setupOrderButton).toHaveBeenCalled();
  });

  it('should handle order button click', () => {
    const spy = spyOn(component, 'handleOrderButtonClick').and.callThrough();
    const button = fixture.nativeElement.querySelector('.cart-content__order-button');
    button.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should have correct routerLink set for the order button', () => {
    const button = fixture.nativeElement.querySelector('.cart-content__order-button');
    // Angular attribute added during runtime to reflect the value of the `[routerLink]` directive.
    expect(button.getAttribute('ng-reflect-router-link')).toEqual('/shop/order-progress');
  });  
});
