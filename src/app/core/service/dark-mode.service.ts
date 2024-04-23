import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

/* the service provides a centralized and reusable way to manage dark mode functionality throughout the app. */
export class DarkModeService {
  private darkModeSubject: BehaviorSubject<boolean>;
  public darkMode$: Observable<boolean>;

  constructor() {
    this.darkModeSubject = new BehaviorSubject<boolean>(false);
    this.darkMode$ = this.darkModeSubject.asObservable();
  }

  toggleDarkMode(): void {
    const isDarkMode = !this.darkModeSubject.value;
    this.darkModeSubject.next(isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
