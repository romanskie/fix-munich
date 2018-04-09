import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as L from 'leaflet';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import LeafletUtils from '../utils/LeafletUtils';
import { MainMapService } from './main-map.service';

@Injectable()
export class CurrentLocationFromImageUploadService {

private currentMainMapCenter: L.LatLng = null;
  currentLocationFromImageUploadBehaviorSubject = new BehaviorSubject<L.LatLng>(MainMapService.defaultMapCenterCoords);
  currentPositionMarkerFromImageUploadBehaviorSubject = new BehaviorSubject<L.Marker>(L.marker(MainMapService.defaultMapCenterCoords));

  constructor(private mainMapService: MainMapService) {
        this.currentMainMapCenter =  this.mainMapService.mapCenterBehaviorSubject.getValue();
  }

  getCurrentLocationFromImageUpload = (): BehaviorSubject<L.LatLng> => {
    return this.currentLocationFromImageUploadBehaviorSubject
  }

  getCurrentPositionMarkerFromImageUpload = (): BehaviorSubject<L.Marker> => {
    return this.currentPositionMarkerFromImageUploadBehaviorSubject
  }

  setCurrentLocationFromImageUpload = (currentLocation: L.LatLng) => {
    this.currentLocationFromImageUploadBehaviorSubject.next(currentLocation)
  }

  setCurrentPositionMarkerFromImageUpload = (currentPositionMarker: L.Marker) => {
    this.currentPositionMarkerFromImageUploadBehaviorSubject.next(currentPositionMarker)
  }

}
