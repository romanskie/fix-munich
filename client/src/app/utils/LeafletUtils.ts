// /// <reference types="../../../node_modules/exif-js/exif.d.ts" />
import * as EXIF from 'exif-js';
import Utils from './Utils';
import * as L from 'leaflet';
import { latLng, tileLayer, marker, icon, LeafletEvent } from 'leaflet';
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { concatAll, switchAll, merge, mergeAll, flatMap } from 'rxjs/operators';
import { Number } from '../models/foto-meta-data';

export default class LeafletUtils {

    static extractGPSData = (src: string): L.LatLng => {
        const contentType = src.split(',')[0];
        const b64 = src.split(',')[1];
        const buffer = Utils.base64ToArrayBuffer(src, contentType);
        const exifMetaData = EXIF.readFromBinaryFile(buffer);

        if(exifMetaData && exifMetaData.GPSLatitude && exifMetaData.GPSLongitude) {
            const gpsLatitude = LeafletUtils.latLongToDecimal(exifMetaData.GPSLatitude);
            const gpsLongitude = LeafletUtils.latLongToDecimal(exifMetaData.GPSLongitude);
            return L.latLng(gpsLatitude, gpsLongitude);
        }
        return null;
    }

    static latLongToDecimal = (number: Number) => {
        return number[0].numerator + number[1].numerator /
            (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
    }


    static calculateGPSCentroid = (data: L.LatLng[]): L.LatLng => {
        const len = data.length;
        const avg = data.reduce((acc, curr) => {
            return L.latLng(acc.lat + curr.lat, acc.lng + curr.lng);
        });
        const result = L.latLng(avg.lat / len, avg.lng / len);
        return result;
    }

    static addGeoSearchControlToMap = (map: L.Map, apiKey: String): GeoSearchControl => {
        const provider = new GoogleProvider({
            params: {
                key: apiKey,
            },
        });
        const searchControl = new GeoSearchControl({
            provider: provider,
            showMarker: false,                                   // optional: true|false  - default true
            showPopup: true,                                   // optional: true|false  - default false
            retainZoomLevel: false,                             // optional: true|false  - default false
            animateZoom: false,                                  // optional: true|false  - default true
            autoClose: true,                                   // optional: true|false  - default false
            searchLabel: 'Adresse suchen',                       // optional: string      - default 'Enter address'
            keepResult: true,
            style: 'bar',   
            autoComplete: true,             // optional: true|false  - default true
            autoCompleteDelay: 250, 
        }).addTo(map);
        map.addControl(searchControl);
    }



    static createCustomMarker = (location: L.LatLng, options: L.MarkerOptions, ticket: any): L.Marker => {
        const customMarker = L.Marker.extend({
            options: {
                document: {}
            }
        });
        customMarker.options = options;
        customMarker.options.document = ticket;
        return new customMarker(location, options);
    }

    static createMarkerIcon(color?: String): L.Icon {
        if (color === "red") {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-red.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }
        else if ( color === "green") {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-green.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }
        else if ( color === "black") {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-black.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }
        else if ( color === "yellow") {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-yellow.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }
        else if ( color === "orange") {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-orange.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }
        else {
            return L.icon({
                //className: 'animated-marker',
                iconSize: [25, 41],
                iconAnchor: [13, 41],
                iconUrl: '../../assets/marker-icon-blue.png',
                shadowUrl: '../../assets/marker-shadow.png',
                //iconUrl: 'assets/marker-icon.png',
                //hadowUrl: 'assets/marker-shadow.png'
            });
        }

    }


    static disableMapTouch = (map: L.Map) => {
        map.scrollWheelZoom.disable()
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) {
            map.tap.disable()
        }
    }


    static addMapSearch = (map: L.Map) => {
        const provider = new GoogleProvider({
            params: {
                key: 'AIzaSyAdEy_QBKjlp-Oa7rP0Fq51VT6YTfhB6-s',
            },
        });
        const searchControl = new GeoSearchControl({
            provider: provider,
            showMarker: false,                                   // optional: true|false  - default true
            showPopup: false,                                   // optional: true|false  - default false
            retainZoomLevel: false,                             // optional: true|false  - default false
            animateZoom: true,                                  // optional: true|false  - default true
            autoClose: false,                                   // optional: true|false  - default false
            searchLabel: 'Addresse suchen',                       // optional: string      - default 'Enter address'
            keepResult: false
        }).addTo(map);
        map.addControl(searchControl);
    }


    static centerLocation = (map: L.Map, locationToGo: L.LatLng, currentZoomLevel: number) => {
        map.setView(locationToGo, currentZoomLevel, { animate: true, noMoveStart: true });
    }

    static clearLayer = (layer: L.LayerGroup) => {
        layer.eachLayer((layer: L.Layer) => {
            layer.remove();
        })
    }

}
