import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopInfoComponent } from './shop-info.component';

describe('ShopInfoComponent', () => {
  let component: ShopInfoComponent;
  let fixture: ComponentFixture<ShopInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
