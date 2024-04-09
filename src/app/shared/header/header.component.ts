import { ChangeDetectionStrategy, Component, Signal, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { DarkModeService } from '../../core/service/dark-mode.service';
import { DarkModeTogglerComponent } from '../dark-mode-toggler/dark-mode-toggler.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { InformationComponent } from '../../dialogs/information/information.component';
import { UiStateService } from '../../core/service/ui-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, DarkModeTogglerComponent, LanguageSwitcherComponent, InformationComponent, TranslateModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HeaderComponent {
  imageUrl: string = 'assets/images/logo.svg';
  hoveredImageUrl: string = 'assets/images/logo-header.svg';
  isHovered: boolean = false;
  
  showPopup: boolean = false;
  showPrivacyPolicyPopup: boolean = false;

  @ViewChild(DarkModeTogglerComponent) darkModeToggler!: DarkModeTogglerComponent;
  showBackButton: Signal<boolean>;

  constructor(
    private readonly location: Location,
    private readonly uiStateService: UiStateService,
    public readonly darkModeService: DarkModeService,
  ) {
    this.showBackButton = this.uiStateService.showBackButton;
  }

  navigateBack(): void {
    this.location.back();
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  displayInfoPopup(): void {
    this.showPopup = true;
  }

  closeInfoPopup(): void {
    this.showPopup = false;
  }
}
