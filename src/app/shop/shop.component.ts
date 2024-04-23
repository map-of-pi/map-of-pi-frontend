import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { ShopInfoComponent } from './shop-info/shop-info.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoyaltyInfoComponent } from './loyalty-info/loyalty-info.component';
import { UiStateService } from '../core/service/ui-state.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [ShoppingCartComponent, TransactionsComponent, ShopInfoComponent, ProductListComponent, LoyaltyInfoComponent, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopComponent {
  constructor(
    private readonly uiStateService: UiStateService,
  ) {
    this.uiStateService.setShowBackButton(true);
  }
}
