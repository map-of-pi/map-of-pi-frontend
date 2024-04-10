import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Icon, icon, LatLng, LatLngBounds, MapOptions, tileLayer } from 'leaflet';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly initZoomLevel = 18;
  initCoords: number[] = [];
  private readonly geolocationTrigger = new Subject<void>();
  private readonly maxZoomLevel = 18;
  private readonly minZoomLevel = 2;
  private readonly tileLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  readonly geoLoading = signal<boolean>(false);
  readonly geolocationTriggerEvent$ = this.geolocationTrigger.asObservable();

  triggerGeolocation(): void {
    this.geolocationTrigger.next();
  }

  setInitialCoordinates(arr: number[]): void {
    this.initCoords = [arr[0], arr[1]];
  }

  getCurrentPosition(): Observable<GeolocationCoordinates> {
    this.geoLoading.set(true);
    return new Observable((observer) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            observer.next(position.coords);
            observer.complete();
            this.geoLoading.set(false);
          },
          (error: GeolocationPositionError) => {
            observer.error(error?.message);
            this.geoLoading.set(false);
          },
        );
      } else {
        observer.error('Geolocation is not available in this browser.');
        this.geoLoading.set(false);
      }
    });
  }

  getMapOptions(): MapOptions {
    const southWest = new LatLng(-90, -180);
    const northEast = new LatLng(90, 180);
    const bounds = new LatLngBounds(southWest, northEast);

    return {
      layers: [
        tileLayer(this.tileLayer, {
          noWrap: true,
          maxZoom: this.maxZoomLevel,
          minZoom: this.minZoomLevel,
          // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      ],
      zoom: this.initZoomLevel,
      zoomControl: false,
      center: [37.5665, 126.978],
      maxBounds: bounds,
      attributionControl: false,
    };
  }

  getMarkerIcon(): Icon {
    return icon({
      ...Icon.Default.prototype.options,
      iconUrl: 'assets/images/logo.svg',
      iconRetinaUrl: 'assets/images/logo.svg',
      shadowUrl: 'assets/marker-shadow.png',
    });
  }
  getUserMarkerIcon(): Icon {
    return icon({
      ...Icon.Default.prototype.options,
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
    });
  }
  getMiddleIcon(): Icon {
    return icon({
      ...Icon.Default.prototype.options,
      iconUrl: 'assets/images/map/yellow.png',
      iconRetinaUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [41, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  async getUserPositionManualy() {
    const response = await axios.get('https://ipapi.co/json/');

    const { data } = response;

    const coordinates = [data.latitude, data.longitude];
    return coordinates;
  }
}
