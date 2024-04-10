import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loyalty-scan',
  standalone: true,
  imports: [],
  templateUrl: './loyalty-scan.component.html',
  styleUrl: './loyalty-scan.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyScanComponent {}
