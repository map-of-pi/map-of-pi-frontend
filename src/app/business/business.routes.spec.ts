import { Routes } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BusinessComponent } from './business.component';
import { BUSINESS_ROUTES } from './business.routes';

describe('Business Routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  it('should have the default route pointing to BusinessComponent', () => {
    const routes: Routes = BUSINESS_ROUTES;
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute).toBeDefined();
    if (defaultRoute) {
      expect(defaultRoute.component).toBe(BusinessComponent);
    }
  });

  it('should contain the expected routes', () => {
    const routes: Routes = BUSINESS_ROUTES;
    const routePaths = routes.map((r) => r.path);
    expect(routePaths).toContain('orders');
    expect(routePaths).toContain('loyalty-scan');
    // expect(routePaths).toContain('business-config');
    expect(routePaths).toContain('business-photos');
    expect(routePaths).toContain('loyalty-program');
    expect(routePaths).toContain('products');
    expect(routePaths).toContain('qr-code');
  });
});
