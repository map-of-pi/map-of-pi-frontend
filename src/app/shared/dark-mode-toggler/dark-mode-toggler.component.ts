import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DarkModeService } from '../../core/service/dark-mode.service';

@Component({
  selector: 'app-dark-mode-toggler',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './dark-mode-toggler.component.html',
  styleUrl: './dark-mode-toggler.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DarkModeTogglerComponent {
  constructor(private darkModeService: DarkModeService) {}

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }
}
