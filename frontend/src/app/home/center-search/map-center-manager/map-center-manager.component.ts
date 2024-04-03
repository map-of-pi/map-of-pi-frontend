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

}
