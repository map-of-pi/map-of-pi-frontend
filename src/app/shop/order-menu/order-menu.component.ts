import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { ShopService } from '../../core/service/shop.service';
import { CurrentUserService } from '../../core/service/current-user.service';
import { PaymentsService } from '../../core/service/payments.service';

@Component({
  selector: 'app-order-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule, TranslateModule],
  templateUrl: './order-menu.component.html',
  styleUrl: './order-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMenuComponent implements OnInit {
  shopId: string = '';
  shop: any;
  params: ActivatedRoute = inject(ActivatedRoute);
  currentUser: any;
  isShop: boolean = true;

  cartItemCount: number = 0;
  businessType: string = 'General';
  stampsButtonText: string = 'XX Stamps';
  highlightText: string = 'You can order online and pay in person';

  constructor(
    private shopServices: ShopService,
    private currentUserService: CurrentUserService,
    private paymentService: PaymentsService,
    private logger: NGXLogger) {
      this.shopId = this.params.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.logger.info('Fetching shop data: ', this.shop);

    this.shopServices.getShop(this.shopId)
      .then((response) => {
        this.isShop = true;
        this.shop = response.data;
        this.currentUser = this.currentUserService.getCurrentUser();
        this.logger.info('Here is the real shop and associated products: ', this.shop.products);
      })
      .catch((err) => {
        this.logger.error('Error while setting up shop : ', err);
      });
  }

  decreaseQuantity(product: any): void {
    // Handle decreasing quantity for a product
    product.quantity = Math.max(0, product.quantity - 1); // Ensure quantity does not go below 0
  }

  increaseQuantity(product: any): void {
    // Handle increasing quantity for a product
    product.quantity++;
  }

  addToCart(product: any): void {
    this.updateCartCount(1);
    product.showAddButton = false;
    product.showDeleteButton = true;
  }

  removeFromCart(product: any): void {
    this.updateCartCount(-product.quantity);
    product.quantity = 1;
    product.showAddButton = true;
    product.showDeleteButton = false;
  }

  /**
   * Updates the shopping cart count.
   * @param {number} amount - The amount to adjust the cart count by.
   */
  updateCartCount(amount: number): void {
    this.cartItemCount += amount;
    this.cartItemCount = Math.max(this.cartItemCount, 0); // Ensure count does not go below 0
  }

  openShoppingCart() {
    // Placeholder method
  }

  switchToStampsMenu() {
    // Placeholder method
  }

  switchToProductsMenu() {}

  consoleShop(): void {
    this.logger.info('Here is the shop', this.shop);
  }

  orderProduct(amount: number) {
    this.paymentService.orderProductFromShop('test', amount, {
      productId: 'test',
    });
  }

  getStars(rating: number): { fill: boolean }[] {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 0; i < 5; i++) {
      stars.push({ fill: i < roundedRating });
    }

    return stars;
  }
}
