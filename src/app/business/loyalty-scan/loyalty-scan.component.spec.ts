import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyScanComponent } from './loyalty-scan.component';

describe('LoyaltyScanComponent', () => {
  let component: LoyaltyScanComponent;
  let fixture: ComponentFixture<LoyaltyScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoyaltyScanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoyaltyScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
