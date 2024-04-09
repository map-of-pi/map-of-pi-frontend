import { Routes } from '@angular/router';
import { AddProductComponent } from './business/manage-business/add-product/add-product.component';
import { BusinessPhotosComponent } from './business/business-settings/business-photos/business-photos.component';
import { ManageBusinessComponent } from './business/manage-business/manage-business.component';
import { OrderMenuComponent } from './shop/order-menu/order-menu.component';
import { BusinessMenuComponent } from './business/business-settings/business-menu/business-menu.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'business',
    loadChildren: () => import('./business/business.routes').then((m) => m.BUSINESS_ROUTES),
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.routes').then((m) => m.SHOP_ROUTES),
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    loadComponent: () => import('./shared/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
  },
  {
    path: 'terms-of-service',
    title: 'Terms of Service',
    loadComponent: () => import('./shared/terms-of-service/terms-of-service.component').then((m) => m.TermsOfServiceComponent),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'add-product',
    component: AddProductComponent,
  },
  {
    path: 'business-photos',
    component: BusinessPhotosComponent,
  },
  {
    path: 'manage-business/:id',
    component: ManageBusinessComponent,
  },
  {
    path: 'view-shop/:id',
    component: OrderMenuComponent,
  },

  {
    path: 'business-config/:id',
    component: BusinessMenuComponent,
  },
];
