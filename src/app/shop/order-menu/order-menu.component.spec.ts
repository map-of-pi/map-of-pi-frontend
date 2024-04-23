// TODO -> import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { ShopService } from '../../core/service/shop.service';
// import { OrderMenuComponent } from './order-menu.component';

// describe('OrderMenuComponent', () => {
//   let component: OrderMenuComponent;
//   let fixture: ComponentFixture<OrderMenuComponent>;
//   let shopService: jasmine.SpyObj<ShopService>;

//   beforeEach(async () => {
//     const shopServiceSpy = jasmine.createSpyObj('ShopService', ['getShop']);
    
//     await TestBed.configureTestingModule({
//       imports: [OrderMenuComponent, RouterTestingModule],
//       providers: [{ provide: ShopService, useValue: shopServiceSpy }]
//     }).compileComponents();
    
//     fixture = TestBed.createComponent(OrderMenuComponent);
//     component = fixture.componentInstance;
//     shopService = TestBed.inject(ShopService) as jasmine.SpyObj<ShopService>;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
