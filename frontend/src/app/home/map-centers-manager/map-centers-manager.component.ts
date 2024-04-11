import { Component } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Map, marker, Layer } from 'leaflet';

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

}
