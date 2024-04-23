import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-products-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSlideToggleModule, MatIconModule, TranslateModule],
  templateUrl: './products-settings.component.html',
  styleUrl: './products-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsSettingsComponent {
  productsForm = this.formBuilder.group({
    showProducts: [false, Validators.required],
    isPiPaymentEnabled: [false, Validators.required],
    canOrderWithoutPayment: [false, Validators.required],
  });

  constructor(private readonly formBuilder: FormBuilder) {}
}
