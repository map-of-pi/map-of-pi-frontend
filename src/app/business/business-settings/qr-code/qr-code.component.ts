import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [],
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeComponent {}
