import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TransactionsComponent implements OnInit {

  constructor(private logger: NGXLogger) {}

  ngOnInit(): void {
    this.setupBackButton();
    this.setupWalletButton();
    this.setupDropdownButton();
    this.setupPayButton();
    this.setupCancelPurchaseButton();
  }

  /**
   * Attaches an event listener to the back button.
   */
  setupBackButton() {
    const backButton = document.querySelector('.wallet-header__back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        // Back navigation logic goes here.
        history.back();
        this.logger.debug('Back button logic goes here');
      });
    }
  }

  /**
   * Attaches an event listener to the wallet button.
   */
  setupWalletButton() {
    const walletButton = document.querySelector('.wallet-header__wallet-button');
    if (walletButton) {
      walletButton.addEventListener('click', () => {
        // Insert logic to open the wallet here.
        this.logger.debug('Open wallet logic goes here');
      });
    }
  }

  /**
   * Attaches an event listener to the dropdown button.
   */
  setupDropdownButton() {
    const dropdownButton = document.querySelector('.wallet-header__dropdown-button');
    if (dropdownButton) {
      dropdownButton.addEventListener('click', () => {
        // Insert logic to toggle the dropdown menu here.
        this.logger.debug('Dropdown logic goes here');
      });
    }
  }

  /**
   * Attaches an event listener to the pay with Pi button.
   */
  setupPayButton() {
    const payButton = document.querySelector('.actions__button--pay');
    if (payButton) {
      payButton.addEventListener('click', () => {
        // Purchase with Pi logic goes here.
        history.back();
        this.logger.debug('Pay with Pi logic goes here');
      });
    }
  }

  /**
   * Attaches an event listener to the cancel purchase button.
   */
  setupCancelPurchaseButton() {
    const cancelButton = document.querySelector('.actions__button--cancel');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        // Insert logic to cancel purchase button here.
        this.logger.debug('Cancel purchase logic goes here');
      });
    }
  }
}
