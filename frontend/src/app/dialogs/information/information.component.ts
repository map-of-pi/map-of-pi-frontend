import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.scss'
})

export class InformationComponent {
  showPopup: boolean = true;

  version: string = 'Beta V2.0';
  logo: string = "../../assets/images/logo.svg";
  email: string = 'info@mapofpi.com';

  stopPropagation(event: MouseEvent): void {
    // prevent the click event from reaching the parent container.
    event.stopPropagation();
  }
}
