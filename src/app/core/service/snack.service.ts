import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackService {
  constructor(private readonly snackBar: MatSnackBar) {}

  showError(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  showMessage(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
