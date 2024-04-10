import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsSettingsComponent } from './products-settings.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ProductsSettingsComponent', () => {
  let component: ProductsSettingsComponent;
  let fixture: ComponentFixture<ProductsSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsSettingsComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
