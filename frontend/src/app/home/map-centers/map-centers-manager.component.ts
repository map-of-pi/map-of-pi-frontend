import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { Map, marker, Layer } from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { SearchBarComponent } from '../../search-bar/search-bar.component';

import { GeolocationService } from '../../../core/service/geolocation.service';
// import { CustomMarkerOptions } from './marker-options.interface';

@Component({
  selector: 'app-map-centers-manager',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map-centers-manager.component.html',
  styleUrl: './map-centers-manager.component.scss'
})
export class MapCentersManagerComponent {
  layer?: Layer;
  map!: Map;
  options:any;
  showPopup: boolean = false;
  searchBarQuery: string = '';
  userPositions: any[] = [];
}


