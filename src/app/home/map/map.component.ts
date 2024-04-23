import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateService } from '@ngx-translate/core';

import axios from 'axios';
import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { Map, marker, Layer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { GeolocationService } from '../../core/service/geolocation.service';
import { ShopService } from '../../core/service/shop.service';
import { SnackService } from '../../core/service/snack.service';
import { dummyCoordinates } from '../../core/model/business';
import { CustomMarkerOptions } from './marker-options.interface';

export type SearchType = 'business' | 'product';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule, RouterModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit, OnDestroy {
  layer?: Layer;
  map!: Map;
  options;
  id: string = '65e2d67a38e1e60afd74378d';
  navigator: Router = inject(Router);
  showPopup: boolean = false;
  searchBarQuery: string = '';
  allShops: any[] = [];
  filteredShops: any[] = [];
  userPositions: any[] = [];
  
  // Translation strings
  distanceMessage!: string;
  onlinePiOrdersAllowedMessage!: string;
  productsAvailable!: string;
  visitShop!: string;
  takeRoute!: string;
  userLocation!: string;
  mobileTransporationDistanceMessage!: string;
  mobileTransportationTimeMessage!: string;
  cancelButton!: string;
  middleClickedMessage!: string;
  unknownMarkerClickedMessage!: string;

  coordinates = dummyCoordinates;
  
  private userMarker: any;
  private langChangeSubscription: Subscription;
  private geolocationSubscription: Subscription;

  @Output() filteredShopCountChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly snackService: SnackService,
    private shopService: ShopService,
    private translateService: TranslateService,
    private logger: NGXLogger) {
      
    this.options = this.geolocationService.getMapOptions();
    this.geolocationSubscription = this.geolocationService.geolocationTriggerEvent$.subscribe(() => {
      this.locateMe();
    });

    this.userPositions = this.shopService.getUserPosition();

    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
      this.removeAllMarkersFromMap();
      this.updateTranslatedStrings();
      this.addAllCoordinatesToMap();
    });
  }

  loadLocationFromLocalStorage(): { lat: number; lng: number } | null {
    const savedLocationJSON = localStorage.getItem('savedLocation');
    return savedLocationJSON ? JSON.parse(savedLocationJSON) : null;
  }
  
  async ngOnInit(): Promise<void> {
    try {
      // Decide initial map centering based on saved location or geolocation
      await this.decideInitialMapCentering();
        // Retrieve the saved location 
        const savedLocation = this.loadLocationFromLocalStorage();
        if (savedLocation) {
          this.dropPinAtSavedLocation(savedLocation);
        }
      // Load shops and add them to the map
      await this.loadShops();
    } catch (error) {
      this.logger.error(error);
    }
  }

  dropPinAtSavedLocation(location: { lat: number; lng: number }): void {
  L.marker([location.lat, location.lng], {
    icon: L.icon({
      iconUrl: 'assets/images/map/map_pin.png', // Ensure you have a pin icon
      iconSize: [34, 34],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(this.map);
}
  
  private async decideInitialMapCentering(): Promise<void> {
    const savedLocation = this.loadLocationFromLocalStorage();
    if (savedLocation) {
      this.initializeMapWithSavedLocation(savedLocation);
    } else {
      this.initializeMapWithGeolocation();
    }
  }
  
  private async loadShops(): Promise<void> {
    const response = await axios.get('https://api-mapofpi.vercel.app/shops');
    this.logger.debug('From Map of Pi: ', response.data?.data);
    const shops: any[] = response.data?.data;
    this.allShops = shops;
    this.filteredShops = shops;
    // Update map with shop locations
    this.updateTranslatedStrings();
    this.addAllCoordinatesToMap();
  }
  
  
// Sets initial map view based on saved location when the map first loads
initializeMapWithSavedLocation(savedLocation: { lat: number, lng: number }): void {
  this.options.zoom = 8; // Default zoom
  this.options.center = L.latLng(savedLocation.lat, savedLocation.lng);
}


initializeMapWithGeolocation(): void {
  // Geolocation logic here.
}

  ngOnDestroy(): void {
    // Unsubscribe from langChangeSubscription to prevent potential memory leaks
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
    // Unsubscribe from geolocationTriggerEvent$ to prevent potential memory leaks
    if (this.geolocationSubscription) {
      this.geolocationSubscription.unsubscribe();
    }
  }
  onMapReady(map: L.Map): void {
    this.map = map;
    
    this.addAllCoordinatesToMap();
  }
  
  locateMe(): void {
    const savedLocation = this.loadLocationFromLocalStorage();
    if (savedLocation) {
      this.map.setView([savedLocation.lat, savedLocation.lng],); 
    } else {
      this.getCurrentLocation();
    }
  }
  
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Explicitly declare coords as a LatLngTuple
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        this.map.setView(coords);
      }, (error) => {
        console.error('Error getting location', error);
        this.snackService.showMessage("We couldn't access your location. Please ensure your location settings are enabled and try again.");
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      this.snackService.showMessage("Your browser does not support location services, which are needed for this feature. Please update your browser or try a different one.");
    }
  }

  // Filter shops based on search query
  filterShops(query: string, searchType: SearchType): void {
    this.logger.debug(`Filtering shops based on searchType: ${searchType}`);
    // search by business
    if (searchType === 'business') {
      this.filteredShops = this.allShops.filter(shop =>
        !query || (shop.name && shop.name.toLowerCase().includes(query.toLowerCase()))
      );
    // search by product
    } else if (searchType === 'product') {
      this.filteredShops = this.allShops.filter(shop =>
        !query || shop.products.some((product: { name?: string; }) =>
          product.name && product.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      this.logger.error("Unexpected and invalid search type: ", searchType);
      this.filteredShops = [];
    }

    this.logger.debug("Filtered shops:", this.filteredShops);
    // Update the map markers to reflect the filtered shops
    this.removeAllMarkersFromMap();
    this.addAllCoordinatesToMap(this.filteredShops);
    // Emit the count of filtered shops
    this.filteredShopCountChange.emit(this.filteredShops.length);
  }

  private updateTranslatedStrings(): void {
    this.distanceMessage = this.translateService.instant('BUSINESS_MARKER_DIALOG.DISTANCE_MESSAGE');
    this.onlinePiOrdersAllowedMessage = this.translateService.instant('BUSINESS_MARKER_DIALOG.ONLINE_PI_ORDERS_ALLOWED_MESSAGE');
    this.productsAvailable = this.translateService.instant('BUSINESS_MARKER_DIALOG.PRODUCTS_AVAILABLE_MESSAGE');
    this.visitShop = this.translateService.instant('BUSINESS_MARKER_DIALOG.BUTTONS.VISIT_SHOP');
    this.takeRoute = this.translateService.instant('BUSINESS_MARKER_DIALOG.BUTTONS.TAKE_ROUTE');
    this.userLocation = this.translateService.instant('MAP.USER_LOCATION');
    this.mobileTransporationDistanceMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_DISTANCE_MESSAGE');
    this.mobileTransportationTimeMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_TIME_MESSAGE');
    this.cancelButton = this.translateService.instant('MAP.BUTTONS.CANCEL'); 
    this.middleClickedMessage = this.translateService.instant('MAP.MIDDLE_CLICKED_MESSAGE');
    this.unknownMarkerClickedMessage = this.translateService.instant('MAP.UNKNOWN_MARKER_CLICKED_MESSAGE');
  }

  async track() {
    this.logger.debug('Coordinates from shop in track: ', this.shopService.getUserPosition());

    const location = await axios.get('https://ipapi.co/json/');

    const { data } = location;

    this.logger.debug('User data: ', data);

    const coordinates = [[data.latitude, data.longitude]];

    coordinates.forEach((coord) => {
      const userMarkerOptions: CustomMarkerOptions = {
        icon: this.geolocationService.getUserMarkerIcon(),
        isCurrentUser: true,
        zIndexOffset: -100
      };

      this.userMarker = marker([coord[0], coord[1]], userMarkerOptions)
        .bindPopup(`<div class="">${this.userLocation}</div>`)
        .openPopup();

      this.map.addLayer(this.userMarker);
      this.map.flyTo([coord[0], coord[1]], 15);
    });
  }

  addAllCoordinatesToMap(shops?: any[]): void {
    const shopsToAdd = shops ?? this.allShops;

    shopsToAdd.forEach((shop: any, index: number) => {
      if (shop.coordinates && shop.coordinates.length === 2) {
        const markerLayer = marker([shop.coordinates[0], shop.coordinates[1]], {
          icon: this.geolocationService.getMarkerIcon(),
        }).bindPopup(this.generatePopupContent(shop))
          .addTo(this.map)
          .addEventListener('click', (e) => {
            const commingBtn = document.querySelectorAll('#comming');
            commingBtn.forEach((btn) => {
              btn.addEventListener('click', async () => {
                const location = await axios.get('https://ipapi.co/json/');

                const { data } = location;

                const userLocation = [[data.latitude, data.longitude]];

                const shopLocation = [shop.coordinates[0], shop.coordinates[1]];

                this.map.closePopup();

                const creatingMarkers = (i: number, waypoints: any, n: number) => {
                  let icon;

                  if (i === 0) {
                    icon = this.geolocationService.getUserMarkerIcon();
                  } else if (i === n - 1) {
                    icon = this.geolocationService.getMarkerIcon();
                  } else {
                    icon = this.geolocationService.getMiddleIcon();
                  }

                  const newMarker = L.marker(waypoints.latLng, {
                    icon: icon,
                  }).addTo(this.map);

                  newMarker.getElement()?.setAttribute('data-custom-type', i === 0 ? 'user' : i === n - 1 ? 'shop' : 'middle');

                  newMarker.addEventListener('click', (e) => {
                    const customType = e.target.getElement()?.getAttribute('data-custom-type');

                    switch (customType) {
                      case 'user':
                        this.snackService.showMessage(this.userLocation);
                        break;
                      case 'shop':
                        newMarker.bindPopup(`
                              <div class="p-4">
                                  <div><span class="font-bold text-red-800">${shop.name}</span>${this.mobileTransporationDistanceMessage}<span class="font-bold">${this.mobileTransportationTimeMessage}</span>.</div>
                                  <button id="cancelBtn" class="mt-4 px-4 py-2 bg-orange-800 text-white rounded-md">${this.cancelButton}</button>
                              </div>
                          `);

                        // Wait for the popup to open before attaching the event listener
                        newMarker.on('popupopen', () => {
                          const cancelBtn = document.getElementById('cancelBtn');
                          if (cancelBtn) {
                            cancelBtn.addEventListener('click', () => {
                              // routeControl.removeFrom(this.map);
                              this.map.removeControl(routeControl);
                              newMarker.removeFrom(this.map);
                            });
                          }
                        });

                        break;
                      case 'middle':
                        this.snackService.showMessage(this.middleClickedMessage);
                        break;
                      default:
                        this.snackService.showMessage(this.unknownMarkerClickedMessage);
                    }
                  });
                };

                const routeControl = (window as any).L.Routing.control({
                  waypoints: [(window as any).L.latLng(userLocation[0], userLocation[1]), (window as any).L.latLng(shopLocation[0], shopLocation[1])],
                  showAlternatives: true,
                  createMarker: creatingMarkers,
                  altLineOptions: {
                    styles: [
                      { color: 'black', opacity: 0.15, weight: 9 },
                      { color: 'white', opacity: 0.8, weight: 6 },
                      { color: 'blue', opacity: 0.5, weight: 2 },
                    ],
                  },
                });

                this.logger.debug('From routing : ', { ...routeControl });
                this.logger.debug('Type of routes : ', typeof routeControl);
                routeControl.addTo(this.map);
              });
            });
            const buttonElement = document.getElementById(`${shop._id}`);
            if (buttonElement) {
              buttonElement.addEventListener('click', () => this.clicked(shop._id));
            }
          });
      } else {
          this.logger.error(`Incomplete coordinates for shop ${shop.name}`);
      }
    });
  }

  // remove all map markers except for user position
  removeAllMarkersFromMap(): void {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker && !(layer.options as CustomMarkerOptions)?.isCurrentUser) {
        this.map.removeLayer(layer);
      }
    });
    // close and unbind user location popup for translation switch to register when it rebinds.
    if (this.userMarker) {
      this.userMarker.closePopup();
      this.userMarker.unbindPopup();
    }
  }

  clicked(id: any): void {
    this.navigator.navigate(['view-shop', id]);
  }

  private generatePopupContent(shop: any): string {
    return `
      <div class="max-w-sm rounded-md overflow-hidden">
        <img class="w-full" src="${shop.image}" alt="Shop Image">
          <div class="flex items-center justify-between my-2">
            <div class="font-bold text-md ">${shop.name}</div>
            <img src="assets/shops/star.png" alt="rating"  class="max-w-[50px] w-full"/>
          </div>
          <div class="space-y-1">
            <div class="flex items-center">
              <svg class="h-6 w-6 flex-none fill-gray-100 stroke-green-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <div class="ml-1">
                <code class="text-sm font-bold text-gray-900">XXX km</code> ${this.distanceMessage}
              </div>
            </div>
            <div class="flex items-center">
              <svg class="h-6 w-6 flex-none fill-gray-100 stroke-green-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <div class="ml-1">
                ${this.onlinePiOrdersAllowedMessage}
              </div>
            </div>
            <div class="flex items-center">
              <svg class="h-6 w-6 flex-none fill-gray-100 stroke-green-500 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="11" />
                <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
              </svg>
              <div class="ml-1"><code class="text-sm font-bold text-gray-900">${shop.products.length}</code> ${this.productsAvailable}</div>
            </div>
          </div>
        
        <div class="flex items-center mt-3 justify-center gap-3">
      
        <div class="bg-red-800 w-[100px]   text-center rounded-md text-white py-1 mt-1" id="${shop._id}">${this.visitShop}</div>
        <div class="bg-blue-800 w-[100px]   text-center rounded-md text-white py-1 mt-1" id="comming">${this.takeRoute}</div>
      </div>
    </div>`;
  }
}
