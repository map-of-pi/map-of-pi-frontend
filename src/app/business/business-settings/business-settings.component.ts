import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';

import { NGXLogger } from 'ngx-logger';

import { SnackService } from '../../core/service/snack.service';
import { ShopService } from '../../core/service/shop.service';
import { IShopData } from '../../core/model/business';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-business-settings',  
  standalone: true,
  templateUrl: './business-settings.component.html',
  styleUrls: ['./business-settings.component.scss'],
  imports: [TranslateModule, CommonModule, ReactiveFormsModule, MatSlideToggleModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessSettingsComponent {
  router: Router = inject(Router);
  showPopup: boolean = false;
  selectedImages: any[] = [];
  email: string = 'i@gmail.com';
  image: unknown;
  imagePreview: unknown = '';
  isPreviewAvailable: boolean = false;
  isLoadingPreview: boolean = false;
  testUpload: boolean = false;
  isRegistering: boolean = false;

  registerShopForm = new FormGroup({
    shopName: new FormControl('', Validators.required),
    shopType: new FormControl('General', Validators.required),
    shopAddress: new FormControl('', Validators.required),
    shopPhone: new FormControl('0000000000'),
    shopEmail: new FormControl('', [Validators.required, Validators.email]),
    shopImage: new FormControl('', Validators.required),
    shopDescription: new FormControl('', Validators.required),
  });

  constructor(
    private snackService: SnackService, 
    private shopServices: ShopService, 
    private logger: NGXLogger,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  onFileChange(event: Event): void {
  const element = event.currentTarget as HTMLInputElement;
  let file: File | null = element.files ? element.files[0] : null;

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    this.isLoadingPreview = true;

    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.isLoadingPreview = false;
      this.isPreviewAvailable = true;
      this.testUpload = true;
      this.registerShopForm.get('shopImage')?.markAsTouched();
      this.changeDetectorRef.markForCheck();  // Manually trigger change detection
    };

    reader.onerror = () => {
      console.error("Failed to read file!");
      // Optionally reset image loading state and handle the error visually in UI
      this.isLoadingPreview = false;
      this.changeDetectorRef.markForCheck();  // Ensure UI updates on error
    };
  } else {
    console.log('No file selected or file could not be read');
    // Handle the case where no file is selected
  }
}

async send(): Promise<void> {
  if (this.registerShopForm.valid) {
    this.isRegistering = true;
    const datas: IShopData = {
      shopName: this.registerShopForm.get('shopName')?.value || '',
      shopType: this.registerShopForm.get('shopType')?.value || '',
      shopAddress: this.registerShopForm.get('shopAddress')?.value || '',
      shopPhone: this.registerShopForm.get('shopPhone')?.value || '',
      shopEmail: this.registerShopForm.get('shopEmail')?.value || '',
      shopImage: this.image,
      shopDescription: this.registerShopForm.get('shopDescription')?.value || '',
      isPiPaymentEnabled: true,
    };

    try {
      const response = await this.shopServices.registerShop(datas);
      if (response.status === 200) {
        const newShop = response.data.newShop;
        const shopName = newShop.name;
        const shopId = newShop._id;
        this.snackService.showMessage('Business successfully registered');
        this.snackService.showMessage(`Redirecting to ${shopName} shop`);
        setTimeout(() => {
          this.router.navigate(['business-config', shopId]);
        }, 3000);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (error) {
      this.snackService.showError('Something went wrong. Please try again later.');
      this.logger.error('Error while registering shop:', error);
    } finally {
      this.isRegistering = false;
    }
  } else {
    this.registerShopForm.markAllAsTouched();
    this.snackService.showError('Please fill in all required fields.');
    this.logger.warn('Invalid data logged');
    this.logger.info(this.registerShopForm.value);
  }
}

  displayPopup(): void {
    this.showPopup = true;
  }

  hidePopup(): void {
    this.showPopup = false;
  }
}
