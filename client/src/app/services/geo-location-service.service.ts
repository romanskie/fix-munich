import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { MainMapService } from './main-map.service';
import { latLng } from 'leaflet';
import * as L from 'leaflet';

const GEOLOCATION_ERRORS = {
  'errors.location.unsupportedBrowser': 'Browser does not support location services',
  'errors.location.permissionDenied': 'You have rejected access to your location',
  'errors.location.positionUnavailable': 'Unable to determine your location',
  'errors.location.timeout': 'Service timeout has been reached'
};

@Injectable()
export class GeoLocationService {

  readonly apiKey = "AIzaSyCchSHJthWSYmlM46sBYw-jonpoR7MeV2w";
  static readonly  apiKeyControlSearch = "AIzaSyBXh7s1SREP-VeY8reqyNbdmfWQsNMRXxg";

  constructor(private http: Http, private mainMapService: MainMapService) {

    this.getGeoLocationFromBrowser().subscribe(locationFromBrowser => {
      if(locationFromBrowser !== null) {
        const coordinates = L.latLng(locationFromBrowser.coords.latitude, locationFromBrowser.coords.longitude)
        this.mainMapService.mapCenterBehaviorSubject.next(coordinates);        
      } 
    })

  }

  public createMapsApiUrl(location: L.LatLng) {
    return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${this.apiKey}`;
  }

  public getAddress(location: L.LatLng) {
    const url = this.createMapsApiUrl(location);
    let formatted_address: string;
    return this.http.get(url)
      .map(res => {
        return res.json().results[1].formatted_address
      })
  }

  public getGeoLocationFromBrowser(geoLocationOptions?: any): Observable<any> {
    geoLocationOptions = geoLocationOptions || { timeout: 5000 };

    return Observable.create(observer => {

      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next(position);
            observer.complete();
          },
          (error) => {
            switch (error.code) {
              case 1:
                observer.error(GEOLOCATION_ERRORS['errors.location.permissionDenied']);
                break;
              case 2:
                observer.error(GEOLOCATION_ERRORS['errors.location.positionUnavailable']);
                break;
              case 3:
                observer.error(GEOLOCATION_ERRORS['errors.location.timeout']);
                break;
            }
          },
          geoLocationOptions);
      } else {
        observer.error(GEOLOCATION_ERRORS['errors.location.unsupportedBrowser']);
      }

    });
  }
}

