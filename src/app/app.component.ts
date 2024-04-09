import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Pi } from '@pinetwork-js/sdk';
import { AuthResult } from '@pinetwork-js/sdk/build/types';
import axios from 'axios';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { UiStateService } from './core/service/ui-state.service';
import { ShopService } from './core/service/shop.service';
import { SnackService } from './core/service/snack.service';
import { CurrentUserService } from './core/service/current-user.service';
import { PaymentsService } from './core/service/payments.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(
    private readonly snackService: SnackService,
    private readonly uiStateService: UiStateService,
    private readonly currentUserService: CurrentUserService,
    private readonly shopServices: ShopService,
    private readonly paymentServices: PaymentsService,
  ) {
    this.uiStateService.setShowBackButton(false);
  }

  ngOnInit() {
    this.paymentServices.signInUser();
  }
}
