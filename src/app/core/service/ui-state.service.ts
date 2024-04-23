import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {

  private readonly _showBackButton = signal<boolean>(false);
  readonly showBackButton = this._showBackButton.asReadonly();

  setShowBackButton(isShow: boolean): void {
    this._showBackButton.set(isShow);
  }
}
