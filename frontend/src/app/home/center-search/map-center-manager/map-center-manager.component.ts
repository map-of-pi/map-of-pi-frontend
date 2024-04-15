import { Component, OnInit, OnDestroy, Output, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateService,TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { Map, marker, Layer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

import { GeolocationService } from '../../../core/service/geolocation.service';

@Component({
  selector: 'app-map-center-manager',
  templateUrl: './map-center-manager.component.html',
  styleUrls: ['./map-center-manager.component.scss'],
  standalone: true,
  imports: [SearchBarComponent, LeafletModule, RouterModule, CommonModule, TranslateModule],
})

export class MapCenterManagerComponent implements OnInit {
  layer?: Layer;
  map!: Map;
  options:any;
  id: string = '65e2d67a38e1e60afd74378d';
  navigator: Router = inject(Router);
  showPopup: boolean = true;
  searchBarQuery: string = '';
  userPositions: any[] = [];
  currentPosition: { lat: number; lng: number } | null = null;
  typedMessage: string = '';
  popupDismissed: boolean = false;
  welcomeMessage: string;
  saveCenterButton: string;
  
  // Translation strings
  userLocation!: string;
  mobileTransporationDistanceMessage!: string;
  mobileTransportationTimeMessage!: string;
  cancelButton!: string;
  middleClickedMessage!: string;
  unknownMarkerClickedMessage!: string;
  
  private userMarker: any;
  private langChangeSubscription: Subscription;

constructor(
  private readonly geolocationService: GeolocationService,
  private translateService: TranslateService,
  private changeDetectorRef: ChangeDetectorRef,
  private logger: NGXLogger,
  private router: Router) {

    // Set default language and initial language
  this.translateService.setDefaultLang('en');
  this.translateService.use('en'); 

  this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
    this.updateTranslatedStrings();
    this.typeText('MAP.DYNAMIC_INSTRUCTION', 40); 
  });
  this.welcomeMessage = this.translateService.instant('MAP.WELCOME_MESSAGE');
  this.saveCenterButton = this.translateService.instant('MAP.BUTTONS.SAVE_CENTER');
}

getCenterSearchMapOptions(): L.MapOptions {
  const southWest = L.latLng(-89.98155760646617, -180);
  const northEast = L.latLng(89.99346179538875, 180);
  const bounds = L.latLngBounds(southWest, northEast);

  return {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        noWrap: true,
        maxZoom: 18,
        minZoom: 1,
        attribution: 'Map data © OpenStreetMap contributors'
      }),
    ],
    zoom: 2,
    center: L.latLng([0, 0]),
    maxBounds: bounds,
    attributionControl: false,
    zoomControl: false
  };
}

saveCenter(): void {
  const currentCenter = this.map.getCenter();
  this.saveLocationToLocalStorage(currentCenter);
  console.log(`Center location saved at ${currentCenter.lat}, ${currentCenter.lng}`);

  // Redirect the user to the main page after saving
  this.router.navigate(['/home']);
}

// saveLocationToLocalStorage method
saveLocationToLocalStorage(position: L.LatLng): void {
  localStorage.setItem('savedLocation', JSON.stringify({ lat: position.lat, lng: position.lng }));
  console.log('Location saved to localStorage');
}

async ngOnInit(): Promise<void> {
  try {

  // Wait for translation update before adding coordinates to the map
  this.updateTranslatedStrings();

} catch (error) {
  // this.logger.error(error);
  }
  this.welcomeMessage = this.translateService.instant('MAP.WELCOME_MESSAGE');
  // this.typeText('MAP.DYNAMIC_INSTRUCTION', 40); 
  this.options = this.getCenterSearchMapOptions();
}

onMapReady(map: L.Map): void {
  this.map = map;
  const centerMarker = L.marker(map.getCenter(), { icon: this.getCustomIcon() }).addTo(map);
  map.on('move', () => {
    centerMarker.setLatLng(map.getCenter());
  });

  // this.typeText('MAP.DYNAMIC_INSTRUCTION', 40);
}

// Function to simulate typing effect for given text at specified speed.
typeText(translationKey: string, speed: number): void {
  const fullText = this.translateService.instant(translationKey); // Translate the key to get the actual text

  let i = 0;
  this.typedMessage = ''; // Clear previous message if any
  const interval = setInterval(() => {
    if (i < fullText.length) {
      this.typedMessage += fullText.charAt(i);
      i++;
      this.changeDetectorRef.detectChanges(); // Ensure the UI updates with each character
    } else {
      clearInterval(interval);
    }
  }, speed);
}
  
closePopup(): void {
  this.showPopup = false;
  this.popupDismissed = true;
  this.changeDetectorRef.detectChanges();
}

private updateTranslatedStrings(): void {
  this.userLocation = this.translateService.instant('MAP.USER_LOCATION');
  this.mobileTransporationDistanceMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_DISTANCE_MESSAGE');
  this.mobileTransportationTimeMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_TIME_MESSAGE');
  this.cancelButton = this.translateService.instant('MAP.BUTTONS.CANCEL'); 
  this.middleClickedMessage = this.translateService.instant('MAP.MIDDLE_CLICKED_MESSAGE');
  this.unknownMarkerClickedMessage = this.translateService.instant('MAP.UNKNOWN_MARKER_CLICKED_MESSAGE');
}
getCustomIcon(): L.Icon {
  return L.icon({
    iconUrl: 'assets/images/map/crosshair.png',
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    popupAnchor: [0, -32],
    });
  }
}
