import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  productForm = new FormGroup({
    productName: new FormControl(''),
    productPrice: new FormControl(''),
    productDescription: new FormControl(''),
    productImages: new FormControl(''),
    productStock: new FormControl(''),
    selectedShippingOption: new FormControl(''),
  });

  constructor(private logger: NGXLogger) {}

  selectedImages: any[] = [];

  onFileChange(event: any) {
    if (event.target.files) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (e: any) => {
        this.selectedImages.push(e.target.result);
      };
    }
  }

  submitForm() {
    this.logger.debug(this.selectedImages);
  }
}
