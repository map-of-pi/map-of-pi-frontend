import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-business-photos',
  standalone: true,
  imports: [],
  templateUrl: './business-photos.component.html',
  styleUrl: './business-photos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessPhotosComponent {}
