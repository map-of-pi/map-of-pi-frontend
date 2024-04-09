import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent {
  lastUpdated!: string;
  emailAddress!: string;

  constructor() {
    this.lastUpdated = "3/10/2024";
    this.emailAddress = "info@mapofpi.com";
  }
}
