import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { AddProductComponent } from './add-product.component';

describe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [AddProductComponent, TranslateModule.forRoot()],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
