import { Component, Input, ViewChild, Output, EventEmitter, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/// <reference types="./exif-ts/exif.d.ts" />
import * as EXIF from 'exif-js';

import * as L from 'leaflet';
import { latLng, tileLayer, marker, icon, LeafletEvent } from 'leaflet';
import { FileHolder } from 'angular2-image-upload';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet';
import { open } from 'fs';
import { execFile } from 'child_process';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { map, filter, tap } from 'rxjs/operators';
import { storage } from 'firebase/app';
import { forEach } from '@angular/router/src/utils/collection';
import { GeoLocationService } from '../../services/geo-location-service.service';
import * as crypto from 'crypto-js';
import { CurrentLocationFromImageUploadService } from '../../services/current-location-from-image-upload.service';

import { Category } from '../../models/ticket';
import { Ticket } from '../../models/ticket';

import { ImageUploadService } from '../../services/imageupload.service';
import LeafletUtils from '../../utils/LeafletUtils';
import Utils from '../../utils/Utils';
import { TicketDetailsComponent } from '../ticket-details/ticket-details.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { UploadedImage } from '../../models/uploaded-image';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { CloseAddTicketModalComponent } from '../close-add-ticket-modal/close-add-ticket-modal.component';
import { TicketService } from '../../services/ticket.service';
import { LeafletTicketSummaryMapComponent } from './leaflet-ticket-summary-map/leaflet-ticket-summary-map.component';
import { MainMapService } from '../../services/main-map.service';


@Component({
    selector: 'app-add-ticket',
    templateUrl: './add-ticket.component.html',
    styleUrls: ['./add-ticket.component.css']
})
export class AddTicketComponent implements OnInit {

    @ViewChild("leafletTicketSummaryMapComponent") leafletTicketSummaryMapComponent: LeafletTicketSummaryMapComponent;

    uploadedImages: UploadedImage[] = [];
    uploadedImagesLocations: L.LatLngTuple[] = [];

    imageUploadByUserSubject = new BehaviorSubject<boolean>(false);
    currentLocationExistsSubject = new BehaviorSubject<boolean>(false);
    ticketReadyForSaveSubject = new BehaviorSubject<boolean>(false);

    options;
    layers;
    layersControl;

    readonly defaultMapCenterCoords: L.LatLng = L.latLng(48.140330, 11.564407);
    readonly tileLayerUrl: string = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    currentZoom = 15;
    mapCenterCoords = MainMapService.defaultMapCenterCoords;

    currentLocation: L.LatLng = null;
    geoLocationFromImage: L.LatLng = null;
    currentPositionMarker: L.Marker = null;
    map: L.Map = null;
    markerLayer: L.LayerGroup = new L.LayerGroup();
    ticketDescription: string = '';
    selectedTicketCategory: Category;
    ticket: Ticket = <Ticket>{};

    customStyle: any = {
        selectButton: {
            "font-size": "1rem",
            "font-weight": "normal",
            "font-family": "Roboto,Helvetica,Arial,sans-serif",
            "margin": "0",
            "margin-left": "calc(100% / 2 - 81px)",
            "width": "162px"
        },
        clearButton: {
        },
        layout: {
        },
        previewPanel: {
        }
    }

    spinnerShowing: boolean;


    constructor(private mainMapService: MainMapService, private auth: AuthService, private modalService: NgbModal, public ticketService: TicketService, public imageUploadService: ImageUploadService, private currentLocationFromImageUploadService: CurrentLocationFromImageUploadService, private router: Router, public zone: NgZone, private geoLocationService: GeoLocationService, private loadingSpinnerService: LoadingSpinnerService) {
        /*
        this.geoLocationService.getGeoLocationFromBrowser().subscribe(geolicationFromBrowser => {
            if (geolicationFromBrowser != null) {
                console.log(geolicationFromBrowser)
                this.mapCenterCoords = geolicationFromBrowser;
            }
        })
        */
    }

    ngOnInit() {
        this.options = {
            layers: [
                tileLayer(this.tileLayerUrl, { maxZoom: 18, attribution: '...' }),
                this.markerLayer
            ],
            zoom: 15,
            zoomControl: false,
            center: this.mapCenterCoords,
            doubleClickZoom: false
        };
    }

    onMapReady(map: L.Map) {

        this.map = map;

        this.map.once('moveend, zoomend', (event) => {
            this.currentZoom = event.target._zoom;
            this.map.invalidateSize();
        });

        LeafletUtils.addGeoSearchControlToMap(this.map, GeoLocationService.apiKeyControlSearch);

        this.map.on('dblclick', (event: L.LocationEvent) => {
            this.zone.run(() => {
                this.currentLocationExistsSubject.next(true);

                const clickPosition = event.latlng;
                this.currentLocation = L.latLng(clickPosition.lat, clickPosition.lng);

                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);

                this.markerLayer.clearLayers();
                this.map.addLayer(this.markerLayer);

                const marker = LeafletUtils.createCustomMarker(
                    L.latLng(clickPosition.lat, clickPosition.lng),
                    { icon: LeafletUtils.createMarkerIcon('red'), clickable: true, draggable: true },
                    null
                ).bindPopup('Du kannst mich platzieren wie du möchtest!')

                this.currentPositionMarker = marker;

                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentPositionMarkerFromImageUpload(this.currentPositionMarker);

                this.currentPositionMarker.addTo(this.markerLayer);

                this.currentPositionMarker.on('drag', (event: LeafletEvent) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    this.currentLocationExistsSubject.next(true);
                    this.currentLocation = L.latLng(position.lat, position.lng);

                    // ===> set value in currentLocationService
                    this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);

                    this.map.panTo([position.lat, position.lng]);
                });
            });
        });
    }


    focusOrDrawMarker = () => {
        if (this.currentLocation !== null) {
            if (this.currentPositionMarker !== null) {
                if (this.currentPositionMarker.getLatLng() !== this.currentLocation) {
                    LeafletUtils.clearLayer(this.markerLayer);
                    this.addMarkerFromCurrentLocation();
                    LeafletUtils.centerLocation(this.map, this.currentPositionMarker.getLatLng(), this.currentZoom);
                }

            } else {
                this.addMarkerFromCurrentLocation();
                LeafletUtils.centerLocation(
                    this.map,
                    this.currentPositionMarker.getLatLng(),
                    this.currentZoom);
            }
        } else {
            LeafletUtils.clearLayer(this.markerLayer);
            LeafletUtils.centerLocation(this.map, MainMapService.defaultMapCenterCoords, this.currentZoom);
        }



    }

    addMarkerFromCurrentLocation = () => {
        if (this.currentLocation != null) {
            const marker = LeafletUtils.createCustomMarker(
                this.currentLocation,
                { icon: LeafletUtils.createMarkerIcon('red'), clickable: false, draggable: true },
                null).bindPopup('Meine Position konnte über dein Foto gewonnen werden!')

            this.currentPositionMarker = marker;
            // ===> set value in currentLocationService
            this.currentLocationFromImageUploadService.setCurrentPositionMarkerFromImageUpload(marker);

            marker.addTo(this.markerLayer);

            marker.on('drag', (event: LeafletEvent) => {
                const marker = event.target;
                const position = marker.getLatLng();
                this.currentLocation = L.latLng(position);

                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);

                this.map.panTo(this.currentLocation);
            });
        }
    }


    upload = () => {
        this.loadingSpinnerService.show('addTicketSpinner');
        const files = this.uploadedImages.map(item => item.file);
        const promises = this.imageUploadService.getImageURLPromises(files);

        Observable.combineLatest(this.geoLocationService.getAddress(this.currentLocation), this.auth.user)
            .subscribe(tuple => {
                const address = tuple[0];
                const user = tuple[1];

                Promise.all(promises).then((urls) => {
                    let images = [];
                    this.uploadedImages.map(img => {
                        const filterd = urls.filter(url => {  if(url.indexOf(img.file.name) !== -1) return url });
                        images.push({ name: img.file.name, recordedAt: img.file.lastModifiedDate, url: filterd[0] });
                    })

                    let sampleTicket = {
                        description: this.ticketDescription,
                        createdAt: new Date().toDateString(),
                        images: images,
                        position: [this.currentLocation.lat, this.currentLocation.lng],
                        category: this.selectedTicketCategory,
                        state: 'Warten auf Freigabe',
                        address: address,
                        uid: user ? user.uid : null
                    } as Ticket;
                    this.ticketService.addUnapprovedTicket(sampleTicket);
                    this.loadingSpinnerService.hide('addTicketSpinner');
                    this.router.navigateByUrl('/');
                })
            });

    }



    onRemoved = (fileHolder: FileHolder) => {

        const file = fileHolder.file;
        const src = fileHolder.src.toString();
        const gpsFromSource = LeafletUtils.extractGPSData(src);
        this.uploadedImages = this.uploadedImages.filter(item => item.file !== file);

        if (this.uploadedImages.length === 0) {
            this.currentLocation = null;
            this.geoLocationFromImage = null;
            // ===> set value in currentLocationService
            this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);
            this.currentLocationExistsSubject.next(false);
            this.imageUploadByUserSubject.next(false);

        } else {
            const locations = this.uploadedImages.filter(item => { if (item.location !== null) return item }).map((item) => item.location);

            if (locations.length !== 0) {
                const centroid = LeafletUtils.calculateGPSCentroid(locations);
                this.currentLocation = centroid;
                this.geoLocationFromImage = centroid;

                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);

                this.currentLocationExistsSubject.next(true);

            } else {
                this.currentLocation = null;
                this.geoLocationFromImage = null;
                this.currentLocationExistsSubject.next(false);
            }
        }

    }

    onUploadFinished = (fileHolder: FileHolder) => {
        this.imageUploadByUserSubject.next(true);
        const src = fileHolder.src.toString();
        const file = fileHolder.file;

        const idx = file.name.lastIndexOf('.');
        const fileNameHashed = crypto.MD5(file.name.substr(0, idx)).toString();
        const fileEnding = file.name.substr(idx + 1);

        const gpsFromSource = LeafletUtils.extractGPSData(src);

        if (gpsFromSource != null) {
            this.uploadedImages.push(<UploadedImage>{ file: file, location: gpsFromSource, src: fileHolder.src });
            const locations = this.uploadedImages.filter(item => { if (item.location !== null) return item }).map((item) => item.location);

            if (locations.length !== 0) {
                const centroid = LeafletUtils.calculateGPSCentroid(locations);
                this.currentLocation = centroid;
                this.geoLocationFromImage = centroid;


                this.currentLocationExistsSubject.next(true);

                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);

            }
        } else {
            this.uploadedImages.push(<UploadedImage>{ file: file, location: null, src: fileHolder.src });
            const locations = this.uploadedImages.filter(item => { if (item.location !== null) return item }).map((item) => item.location);

            if (locations.length !== 0) {
                const centroid = LeafletUtils.calculateGPSCentroid(locations);
                this.currentLocation = centroid;
                this.geoLocationFromImage = centroid;

                this.currentLocationExistsSubject.next(true);
                // ===> set value in currentLocationService
                this.currentLocationFromImageUploadService.setCurrentLocationFromImageUpload(this.currentLocation);


            } else {
                this.currentLocation = null;
                this.geoLocationFromImage = null;
                this.currentLocationExistsSubject.next(false);
            }
        }

    }

    openCloseAddTicketModal = () => {
        this.modalService.open(CloseAddTicketModalComponent);
    }


    goToStartOverview = () => {
        this.router.navigateByUrl('/start/overview');
    }

    addTicketCategory = (category: Category) => {
        this.selectedTicketCategory = category;
    }

    isTicketFormValid = (): boolean => {
        if (!this.selectedTicketCategory) return false;
        return true;
    }
}

