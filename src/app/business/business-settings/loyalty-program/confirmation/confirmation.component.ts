import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'loyalty-program-confirmation',
  standalone: true,
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
})
export class ConfirmationComponent {
  isActive = true;
  stampsNeeded?: number;
  itemName?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router 
  ) {}

  toggleLoyaltyCard(): void {
    this.isActive = !this.isActive; // This toggles the state of isActive
  }

  onEdit() {
    // Implement the edit logic or navigation
    this.router.navigate(['/business/loyalty-program']);
  }

  onConfirm() {
    // Implement the confirm logic or navigation
  }
}