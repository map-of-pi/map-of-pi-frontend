import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { ShopService } from '../../../core/service/shop.service';
import { SnackService } from '../../../core/service/snack.service';


@Component({
  selector: 'app-business-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './business-menu.component.html',
  styleUrl: './business-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessMenuComponent implements AfterViewInit, OnInit {
  @ViewChild('menuToggle') menuToggle!: ElementRef<HTMLInputElement>;
  @ViewChild('orderToggleDiv') orderToggleDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('paymentToggleDiv') paymentToggleDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('addItemButtonSection')
  addItemButtonSection!: ElementRef<HTMLDivElement>;
  @ViewChild('floatingButton') floatingButton!: ElementRef<HTMLButtonElement>;

  @ViewChild('itemsDisplayArea') itemsDisplayArea!: ElementRef;
  @ViewChild('addItemModal') addItemModal!: ElementRef;

  shopId: string = '';
  shop: any;
  params: ActivatedRoute = inject(ActivatedRoute);
  isLoading: boolean = false;
  length: number = 0;

  businessProductsForm: FormGroup;

  menuStatusLabel: string = 'on';
  menuStatusLabelColor: string = '#000000';
  orderStatusLabel: string = 'off';
  orderStatusLabelColor: string = 'gray';
  paymentStatusLabel: string = 'on';
  paymentStatusLabelColor: string = '#000000';
  previewImageSrc: string | undefined;
  isPreviewImageVisible: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private shopServices: ShopService,
    private snackService: SnackService,
    private logger: NGXLogger) {
      this.businessProductsForm = this.formBuilder.group({
        itemName: [''],
        itemPrice: [''],
        prepTime: ['0'],
        description: [''],
        image: [''],
      });

      this.shopId = this.params.snapshot.params['id'];
  }

  // wait until all components are fully initialized
  ngAfterViewInit(): void {
    this.loadToggleStates();
    this.loadShopProduct();
  }

  /**
   * Simulates saving the current states of toggle buttons.
   * Placeholder for backend API call.
   */
  saveToggleStates(): void {
    // Placeholder for saving the current state of toggles to the backend
    this.logger.debug('Saving toggle states...');
    // Make API call to the backend
  }

  /**
   * Loads and applies the saved toggle states from the backend.
   */
  loadToggleStates(): void {
    // Placeholder for loading saved toggle states from the backend
    this.logger.debug('Loading toggle states...');
    // Simulate fetching data from the backend
    // TODO: Make an API call to your backend to fetch saved states
    const fetchedStates = {
      menuEnabled: true,
      orderEnabled: false,
      paymentEnabled: true,
    };

    // Apply these states to your toggles
    this.menuToggle.nativeElement.checked = fetchedStates.menuEnabled;

    if (this.orderToggleDiv.nativeElement) {
      const orderToggleInput = this.orderToggleDiv.nativeElement.querySelector('input');
      if (orderToggleInput) {
        orderToggleInput.checked = fetchedStates.orderEnabled;
      }
    }

    if (this.paymentToggleDiv.nativeElement) {
      const paymentToggleInput = this.paymentToggleDiv.nativeElement.querySelector('input');
      if (paymentToggleInput) {
        paymentToggleInput.checked = fetchedStates.paymentEnabled;
      }
    }

    // Update the UI based on these states
    this.updateToggleLabels();
    this.updateSliderAppearance();
    this.updateFloatingButtonVisibility();

    // Initialize the toggles based on the menu setting
    this.initializeToggles();
  }

  initializeToggles(): void {
    // Initial state update
    this.updateSliderAppearance();

    this.logger.debug('menuToggle.nativeElement.checked: ', this.menuToggle.nativeElement.checked);

    if (this.menuToggle && this.menuToggle.nativeElement.checked) {
      this.orderToggleDiv.nativeElement.classList.remove('hidden');
      this.paymentToggleDiv.nativeElement.classList.remove('hidden');
    } else {
      this.orderToggleDiv.nativeElement.classList.add('hidden');
      this.paymentToggleDiv.nativeElement.classList.add('hidden');
    }
  }

  /**
   * Updates the visibility of the floating add item button based on the menu toggle state.
   */
  updateFloatingButtonVisibility(): void {
    if (this.menuToggle.nativeElement.checked) {
      this.floatingButton.nativeElement.classList.remove('hidden');
    } else {
      this.floatingButton.nativeElement.classList.add('hidden');
    }
  }

  /**
   * Updates the labels next to toggles to reflect their current state off/on.
   */
  updateToggleLabels(): void {
    // Update label content based on checkbox state
    if (this.menuToggle && this.orderToggleDiv && this.paymentToggleDiv) {
      // Update menu toggle label
      this.menuStatusLabel = this.menuToggle.nativeElement.checked ? 'on' : 'off';
      this.menuStatusLabelColor = this.menuToggle.nativeElement.checked ? '#000000' : 'gray';

      // Update order toggle label
      const orderToggleInput = this.orderToggleDiv.nativeElement.querySelector('input');
      this.orderStatusLabel = orderToggleInput ? (orderToggleInput.checked ? 'on' : 'off') : '';
      this.orderStatusLabelColor = orderToggleInput ? (orderToggleInput.checked ? '#000000' : 'gray') : '';

      // Update payment toggle label
      const paymentToggleInput = this.paymentToggleDiv.nativeElement.querySelector('input');
      this.paymentStatusLabel = paymentToggleInput ? (paymentToggleInput.checked ? 'on' : 'off') : '';
      this.paymentStatusLabelColor = paymentToggleInput ? (paymentToggleInput.checked ? '#000000' : 'gray') : '';
    }
  }

  /**
   * Updates the appearance of sliders to reflect their state.
   */
  updateSliderAppearance(): void {
    const toggles = document.querySelectorAll('.menu-settings__toggle input');

    toggles.forEach((toggle) => {
      if (toggle instanceof HTMLInputElement) {
        const slider = toggle.nextElementSibling as HTMLElement; // Accurately select the slider span related to each toggle

        if (slider) {
          if (toggle.checked) {
            slider.classList.remove('menu-settings__slider--off');
          } else {
            slider.classList.add('menu-settings__slider--off');
          }
        }
      }
    });
  }

  /**
   * Utility function for toggle maangement.
   */
  onToggleChange(toggleId: string): void {
    if (toggleId === 'menu-toggle') {
      this.initializeToggles();
      this.updateFloatingButtonVisibility();
    }
    this.updateSliderAppearance();
    this.updateToggleLabels();
    this.saveToggleStates();
  }

  showModal(): void {
    if (this.addItemModal) {
      this.logger.debug(this.addItemModal);
      const modal = this.addItemModal.nativeElement as HTMLElement;
      modal.style.display = 'block';
    }
  }

  hideModal(event: Event): void {
    event.preventDefault();
    const modal = this.addItemModal.nativeElement as HTMLElement;
    modal.style.display = 'none';
  }

  // Function to handle image file selection and display a preview
  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageSrc = reader.result as string;
      this.isPreviewImageVisible = true;
    };
    reader.readAsDataURL(file);
  }

  // Function to save items to localStorage
  saveItems(items: any[]): void {
    localStorage.setItem('items', JSON.stringify(items));
  }

  addItemToDisplayArea(item: any): void {
    const itemsDisplayArea = this.itemsDisplayArea.nativeElement;
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.setAttribute('data-id', item.id);

    const truncatedDescription = item.description?.length > 20 ? item.description.substring(0, 20) + '...' : item.description;

    itemElement.innerHTML = `
          <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <img class="w-full h-24 object-cover object-center" src="https://picsum.photos/200" alt="Product Image">
      <div class="p-1">
        <div class="text-gray-900 font-bold text-xl mb-1">${item.name}</div>
        <div class="text-gray-700 text-base mb-1">${truncatedDescription}</div>
        <div class="text-gray-700 text-base mb-1">PI ${item.price}</div>
        <div class="flex justify-between items-center ">
          <button id='delete-${item._id}' class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Delete</button>
          
        </div>
      </div>
    </div>`;
    itemsDisplayArea.appendChild(itemElement);

    const deleteBtn = document.getElementById(`delete-${item._id}`);

    deleteBtn?.addEventListener('click', () => {
      // this.snackService.showMessage(`${item._id} deleted`);
      this.deleteProductFromShop(item._id);
    });
  }

  // Function to adjust the floating button's position based on the items display area's height
  adjustFloatingButtonPosition(): void {
    const floatingButton = this.floatingButton.nativeElement;
    const itemsDisplayArea = this.itemsDisplayArea.nativeElement;
    const displayAreaBottom = itemsDisplayArea.getBoundingClientRect().bottom;
    const viewportHeight = window.innerHeight;
    const newBottomPosition = viewportHeight - displayAreaBottom + -700; // Add a 20px offset from the bottom of the items display area

    floatingButton.style.bottom = `${newBottomPosition}px`;
  }

  clearPreviewImage(): void {
    this.previewImageSrc = undefined;
    this.isPreviewImageVisible = false;
  }

  onModalConfirm(): void {
    const newItem = this.businessProductsForm.value;
    // Generate a unique ID for the new item
    newItem.id = Date.now().toString();

    this.addItemToDisplayArea(newItem);

    const storedItems = localStorage.getItem('items');

    // Save the updated list of items to local storage
    const items = storedItems ? JSON.parse(storedItems) : [];
    items.push(newItem);
    this.saveItems(items);

    // Reset form fields and clear the preview image
    this.businessProductsForm.reset();
    this.previewImageSrc = '';

    this.hideModal(new Event('click'));

    // Adjust floating button position if necessary
    this.adjustFloatingButtonPosition();
  }

  async addProductToShop() {
    this.isLoading = true;

    const response = await this.shopServices.addProductToShop(this.shopId, this.businessProductsForm.value);

    if (response.success) {
      this.loadShopProduct();
      this.isLoading = false;
      this.hideModal(new Event('click'));
      this.snackService.showMessage('Product added successfully 🎉');
    } else {
      this.isLoading = false;
      this.snackService.showMessage('Something went wrong 😟😥');
    }

    this.logger.info('From adding product to shop', response);
  }

  deleteProductFromShop(id: string) {
    const response: any = this.shopServices.deleteProductFromShop(id);
    this.logger.info('From delete :', response.data);

    this.loadShopProduct();

    this.snackService.showMessage('Product deleted successfully');
  }

  loadShopProduct() {
    const itemsDisplayArea = this.itemsDisplayArea.nativeElement;
    itemsDisplayArea.innerHTML = '';
    this.shopServices.getShop(this.shopId).then((res) => {
      this.shop = res.data;
      this.length = res.data.products.length;

      res.data.products.map((product: any) => this.addItemToDisplayArea(product));

      this.logger.info('Populated products from shop', res.data);
    });
  }

  ngOnInit(): void {
    this.shopServices.getShop(this.shopId).then((res) => {
      this.shop = res.data;
      this.length = res.data.products.length;

      this.logger.info('Loading products from shop', res.data.products);
      this.loadShopProduct();
    });
  }
}
