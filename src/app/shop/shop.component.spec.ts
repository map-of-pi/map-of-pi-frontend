import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NGXLogger } from 'ngx-logger';
import { ShopComponent } from './shop.component';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    await TestBed.configureTestingModule({
      imports: [ShopComponent, RouterTestingModule],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
