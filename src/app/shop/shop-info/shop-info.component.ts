import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-shop-info',
  standalone: true,
  imports: [],
  templateUrl: './shop-info.component.html',
  styleUrl: './shop-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopInfoComponent {}
