import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyInfoComponent } from './loyalty-info.component';

describe('LoyaltyInfoComponent', () => {
  let component: LoyaltyInfoComponent;
  let fixture: ComponentFixture<LoyaltyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
