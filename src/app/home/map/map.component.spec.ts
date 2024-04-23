import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { MapComponent, SearchType } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;

  let allShops: { id: number, name: string, products: { id: number, name: string }[] }[];

  beforeEach(async () => {
    const loggerSpy = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);
    
    allShops = [
      { id: 1, name: 'Test Shop 1A', products: [{ id: 1, name: 'Product 1A' }] },
      { id: 2, name: 'Test Shop 1B', products: [{ id: 2, name: 'Product 1B' }] },
      { id: 2, name: 'Test Shop 2A', products: [{ id: 2, name: 'Product 2A' }] }
    ];
    
    await TestBed.configureTestingModule({
      imports: [MapComponent, TranslateModule.forRoot()],
      providers: [{ provide: NGXLogger, useValue: loggerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    mockLogger = TestBed.inject(NGXLogger) as jasmine.SpyObj<NGXLogger>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter shops by business name', () => {
    component.allShops = allShops;

    component.filterShops('Shop 1', 'business');
    expect(component.filteredShops.length).toEqual(2);
  });

  it('should filter shops by product name', () => {
    component.allShops = allShops;

    component.filterShops('Product 2', 'product');
    expect(component.filteredShops.length).toEqual(1);
  });

  it('should handle invalid search types', () => {
    component.allShops = allShops;

    component.filterShops('Shop 1', '' as SearchType);
    expect(component.filteredShops.length).toEqual(0);
  });
});
