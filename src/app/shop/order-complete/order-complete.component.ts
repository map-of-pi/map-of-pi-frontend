import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-complete',
  standalone: true,
  templateUrl: './order-complete.component.html',
  styleUrl: './order-complete.component.scss'
})

export class OrderCompleteComponent implements OnInit {

  ngOnInit(): void {
    this.fetchOrderCompletionDetails();
  }

  fetchOrderCompletionDetails(): void {
    // Fetch details from the backend and update elements accordingly
    // Replace with actual API call
  }

  navigateBack(): void {
    window.history.back();
  }

  navigateToStore(): void {
    window.location.href = '/shop/shopping-cart';
  }
}
