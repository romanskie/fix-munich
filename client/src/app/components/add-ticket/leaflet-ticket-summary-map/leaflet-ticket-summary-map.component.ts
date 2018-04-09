import { Component, OnInit, NgZone } from '@angular/core';
import { latLng, LeafletEvent } from 'leaflet';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs/observable/forkJoin';
import LeafletUtils from '../../../utils/LeafletUtils';
import { CurrentLocationFromImageUploadService } from '../../../services/current-location-from-image-upload.service';
import { MainMapService } from '../../../services/main-map.service';
import { GeoLocationService } from '../../../services/geo-location-service.service';

@Component({
    selector: 'app-leaflet-ticket-summary-map',
    templateUrl: './leaflet-ticket-summary-map.component.html',
    styleUrls: ['./leaflet-ticket-summary-map.component.css']
})
export class LeafletTicketSummaryMapComponent implements OnInit {

    private map: L.Map = null;
    options: any = null;
    layers: any = null;
    private markerLayer: L.LayerGroup = new L.LayerGroup();
    private currentLocation: L.LatLng = null;
    private currentPositionMarker: L.Marker = null;
    private layersControl: any = null;

    readonly mapZoomLvl: number = 15;
    private currentZoom = this.mapZoomLvl;
    readonly mapMaxZoomLvl: number = 18;
    private mapCenterCoords = MainMapService.defaultMapCenterCoords;
    readonly tileLayerUrl: string = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    constructor(private currentLocationFromImageUploadService: CurrentLocationFromImageUploadService, private zone: NgZone, private geoLocationService: GeoLocationService) {

        /*
        this.geoLocationService.getGeoLocationFromBrowser().subscribe( geoLocationFromBrowser => {
            if(geoLocationService !== null) {
                this.mapCenterCoords = geoLocationFromBrowser;
            }
        })
        */

        this.currentLocationFromImageUploadService.getCurrentLocationFromImageUpload().subscribe(currentLocation => {
            if (this.map !== null) {

                if (currentLocation !== null) {
                    LeafletUtils.clearLayer(this.markerLayer);
                    const marker = LeafletUtils.createCustomMarker(currentLocation, { icon: LeafletUtils.createMarkerIcon('red'), clickable: false, draggable: true }, null)
                    this.markerLayer.addLayer(marker);
                    this.currentPositionMarker = marker;

                }
            }
        })
    }

    ngOnInit() {
        this.options = {
            layers: [
                L.tileLayer(this.tileLayerUrl, { maxZoom: this.mapMaxZoomLvl, attribution: '...' }),
            ],
            zoom: this.mapZoomLvl,
            zoomControl: false,
            center: this.mapCenterCoords,
            doubleClickZoom: false,
        };
    }

    onMapReady(map: L.Map) {
        this.map = map;
        this.map.addLayer(this.markerLayer);
        this.disableMapTouch(this.map)

        this.map.once('moveend', (event) => {
            this.currentZoom = event.target._zoom;
            this.map.invalidateSize();
        });
    }


    disableMapTouch = (map: L.Map) => {
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


    focusOrDrawMarker = () => {
        this.zone.run(() => {
            LeafletUtils.centerLocation(this.map, this.currentPositionMarker.getLatLng(), this.currentZoom);
        })
    }

}
