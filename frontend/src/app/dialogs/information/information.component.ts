import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-information',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './information.component.html',
  styleUrl: './information.component.scss'
})

export class InformationComponent {
  showPopup: boolean = true;

  /* pull the APP_VERSION GitHub Environment Variable that is set in the GitHub Actions workflow that is configured in the release.yml; 
     if the runtime value does not exist i.e., browser environment, then pull the static value. */
  version: string = environment.version;

  logo: string = "../../assets/images/logo.svg";
  email: string = 'info@mapofpi.com';

  stopPropagation(event: MouseEvent): void {
    // prevent the click event from reaching the parent container.
    event.stopPropagation();
  }
}
