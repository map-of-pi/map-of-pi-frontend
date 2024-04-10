import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loyalty-info',
  standalone: true,
  imports: [],
  templateUrl: './loyalty-info.component.html',
  styleUrl: './loyalty-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyInfoComponent {}
