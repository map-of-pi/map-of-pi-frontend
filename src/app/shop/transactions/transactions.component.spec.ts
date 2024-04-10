import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TransactionsComponent } from './transactions.component';
import { NGXLogger } from 'ngx-logger';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [TransactionsComponent, RouterTestingModule],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize event listeners on ngOnInit', () => {
    spyOn(component, 'setupBackButton').and.callThrough();
    spyOn(component, 'setupWalletButton').and.callThrough();
    spyOn(component, 'setupDropdownButton').and.callThrough();
    spyOn(component, 'setupPayButton').and.callThrough();
    spyOn(component, 'setupCancelPurchaseButton').and.callThrough();

    component.ngOnInit();

    expect(component.setupBackButton).toHaveBeenCalled();
    expect(component.setupWalletButton).toHaveBeenCalled();
    expect(component.setupDropdownButton).toHaveBeenCalled();
    expect(component.setupPayButton).toHaveBeenCalled();
    expect(component.setupCancelPurchaseButton).toHaveBeenCalled();
  });

  it('should setup back button event listener', () => {
    const backButton = document.createElement('button');
    backButton.classList.add('wallet-header__back-button');
    spyOn(document, 'querySelector').and.returnValue(backButton);
    spyOn(component, 'setupBackButton').and.callThrough();

    component.setupBackButton(); 

    backButton.click();
    expect(component.setupBackButton).toHaveBeenCalled(); 
  });

  it('should setup wallet button event listener', () => {
    const walletButton = document.createElement('button');
    walletButton.classList.add('wallet-header__wallet-button');
    spyOn(document, 'querySelector').and.returnValue(walletButton);
    spyOn(component, 'setupWalletButton').and.callThrough();
  
    component.setupWalletButton();
  
    walletButton.click();
    expect(component.setupWalletButton).toHaveBeenCalled();
  });

  it('should setup dropdown button event listener', () => {
    const dropdownButton = document.createElement('button');
    dropdownButton.classList.add('.wallet-header__dropdown-button');
    spyOn(document, 'querySelector').and.returnValue(dropdownButton);
    spyOn(component, 'setupDropdownButton').and.callThrough();
  
    component.setupDropdownButton();
  
    dropdownButton.click();
    expect(component.setupDropdownButton).toHaveBeenCalled();
  });

  it('should setup pay button event listener', () => {
    const payButton = document.createElement('button');
    payButton.classList.add('.actions__button--pay');
    spyOn(document, 'querySelector').and.returnValue(payButton);
    spyOn(component, 'setupPayButton').and.callThrough();
  
    component.setupPayButton();
  
    payButton.click();
    expect(component.setupPayButton).toHaveBeenCalled();
  });

  it('should have correct routerLink set for the pay button', () => {
    const button = fixture.nativeElement.querySelector('.actions__button--pay');
    // Angular attribute added during runtime to reflect the value of the `[routerLink]` directive.
    expect(button.getAttribute('ng-reflect-router-link')).toEqual('/shop/order-complete');
  }); 

  it('should setup cancel purchase button event listener', () => {
    const cancelPurchaseButton = document.createElement('button');
    cancelPurchaseButton.classList.add('.actions__button--cancel');
    spyOn(document, 'querySelector').and.returnValue(cancelPurchaseButton);
    spyOn(component, 'setupCancelPurchaseButton').and.callThrough();
  
    component.setupCancelPurchaseButton();
  
    cancelPurchaseButton.click();
    expect(component.setupCancelPurchaseButton).toHaveBeenCalled();
  });
});
