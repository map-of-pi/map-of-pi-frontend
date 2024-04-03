import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { Map, marker, Layer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

import { GeolocationService } from '../../../core/service/geolocation.service';
// import { CustomMarkerOptions } from './marker-options.interface';

@Component({
  selector: 'app-map-center-manager',
  templateUrl: './map-center-manager.component.html',
  styleUrls: ['./map-center-manager.component.scss'],
  standalone: true,
  imports: [LeafletModule, RouterModule],
})

export class MapCenterManagerComponent {
  layer?: Layer;
  map!: Map;
  options;
  id: string = '65e2d67a38e1e60afd74378d';
  navigator: Router = inject(Router);
  showPopup: boolean = false;
  searchBarQuery: string = '';
  userPositions: any[] = [];
  
  // Translation strings
  userLocation!: string;
  mobileTransporationDistanceMessage!: string;
  mobileTransportationTimeMessage!: string;
  cancelButton!: string;
  middleClickedMessage!: string;
  unknownMarkerClickedMessage!: string;
  
  private userMarker: any;
  private langChangeSubscription: Subscription;
  private geolocationSubscription: Subscription;

constructor(
  private readonly geolocationService: GeolocationService,
  private translateService: TranslateService,
  private logger: NGXLogger) {
    
  this.options = this.geolocationService.getMapOptions();
  this.geolocationSubscription = this.geolocationService.geolocationTriggerEvent$.subscribe(() => {
    this.locateMe();
  });

  this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
    this.updateTranslatedStrings();
  });
}

async ngOnInit(): Promise<void> {
  try {

    // Wait for translation update before adding coordinates to the map
    this.updateTranslatedStrings();

  } catch (error) {
    this.logger.error(error);
    }
  }

  onMapReady(map: Map): void {
    this.map = map;
  }

  locateMe(): void {
  }

  private updateTranslatedStrings(): void {
    this.userLocation = this.translateService.instant('MAP.USER_LOCATION');
    this.mobileTransporationDistanceMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_DISTANCE_MESSAGE');
    this.mobileTransportationTimeMessage = this.translateService.instant('MAP.MOBILE_TRANSPORTATION_TIME_MESSAGE');
    this.cancelButton = this.translateService.instant('MAP.BUTTONS.CANCEL'); 
    this.middleClickedMessage = this.translateService.instant('MAP.MIDDLE_CLICKED_MESSAGE');
    this.unknownMarkerClickedMessage = this.translateService.instant('MAP.UNKNOWN_MARKER_CLICKED_MESSAGE');
  }
}
