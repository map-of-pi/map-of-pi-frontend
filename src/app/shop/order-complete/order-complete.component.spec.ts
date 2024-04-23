import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderCompleteComponent } from './order-complete.component';

describe('OrderCompleteComponent', () => {
  let component: OrderCompleteComponent;
  let fixture: ComponentFixture<OrderCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCompleteComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(OrderCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch order completion details', () => {
    spyOn(component, 'fetchOrderCompletionDetails');
    component.ngOnInit();
    expect(component.fetchOrderCompletionDetails).toHaveBeenCalled();
  });

  it('should navigate back', () => {
    const navigateBackSpy = spyOn(component, 'navigateBack');
    const backButton = fixture.nativeElement.querySelector('.order-complete__header-back-button');
    backButton.click();
    expect(navigateBackSpy).toHaveBeenCalled();
  });

  it('should navigate to store', () => {
    const navigateToStoreSpy = spyOn(component, 'navigateToStore');
    const backToStoreButton = fixture.nativeElement.querySelector('.order-complete__back-to-store-button');
    backToStoreButton.click();
    expect(navigateToStoreSpy).toHaveBeenCalled();
  });
});
