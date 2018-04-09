import { Component, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { TicketDetailsDrawerComponent } from '../ticket-details-drawer/ticket-details-drawer.component';
import * as L from 'leaflet';
import * as $ from 'jquery';
import { latLng, tileLayer, marker, icon } from 'leaflet';
import LeafletUtils from '../../utils/LeafletUtils';
import { Ticket } from '../../models/ticket';
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';

import { CustomMarkerOptions } from '../../models/customMarkerOptions';
import { TicketService } from '../../services/ticket.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { read } from 'fs';
import { auth } from 'firebase/app';
import { MainMapService } from '../../services/main-map.service';
import { GeoLocationService } from '../../services/geo-location-service.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
    searchControl: any;
    searchControlContainer: any;


    readonly layersControlOptions = { position: 'topleft' };

    private map: L.Map = null;

    @ViewChild(TicketDetailsDrawerComponent)
    private detailsDrawer: TicketDetailsDrawerComponent;

    currentTicket: Ticket = null;

    private addTicketControl;
    private addTicketControlContainer = L.DomUtil.create('div', 'leaflet-control-custom');

    private addSearchControl = null;
    private addSearchControlContainer = L.DomUtil.create('div', 'leaflet-control-custom');

    readonly markersBehaviorSubject = new BehaviorSubject<L.Marker[]>([]);
    readonly layerControlsBehaviorSubject = new BehaviorSubject<any>(null);
    readonly tileLayerUrl: string = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    private readonly tileLayer = L.tileLayer(this.tileLayerUrl, { maxZoom: 18, attribution: '...' });
    private readonly markerLayer = new L.LayerGroup();
    private readonly userMarkerLayer = new L.LayerGroup();
    private readonly newestMarkerLayer = new L.LayerGroup();
    private readonly layerControl = new L.Control({ position: 'bottomright' });


    readonly layers = [
        this.tileLayer,
        this.markerLayer,
        this.userMarkerLayer,
        this.newestMarkerLayer
    ];

    readonly defaultMapOptions = {
        layers: this.layers,
        zoom: 15,
        zoomControl: false,
        center: MainMapService.defaultMapCenterCoords,
    };

    constructor(private geoLocationService: GeoLocationService, public mainMapService: MainMapService, private router: Router, public auth: AuthService, private ngZone: NgZone, private elementRef: ElementRef) { }

    ngOnInit() {

        this.mainMapService.ticketsBehaviorSubject
            .map(tickets => tickets.map(ticket => {
                const marker = LeafletUtils
                    .createCustomMarker(
                    L.latLng(ticket.position[0],
                        ticket.position[1]
                    ),
                    {
                        icon: LeafletUtils.createMarkerIcon(),
                        clickable: true, draggable: false
                    },
                    ticket)
                    .on('click', (e: L.LayerEvent) => {
                        const marker = e.target as L.Marker;
                        const popup = L.popup()
                            .setLatLng(marker.getLatLng())
                            .setContent('<p>' + marker.options["document"]["category"]["name"] + '</p>')
                            .openOn(this.map);

                        this.ngZone.run(() => {
                            this.router.navigateByUrl('/start/' + marker.options["document"]["id"]);
                        });

                    });
                return marker;
            }))
            .subscribe(this.markersBehaviorSubject);



        //case for standard maker layer
        this.markersBehaviorSubject.subscribe(markers => {
            this.markerLayer.clearLayers();
            markers.forEach(marker => {
                this.markerLayer.addLayer(marker);
            })
        })

        //case for standard maker layer
        this.markersBehaviorSubject.subscribe(markers => {
            const n = markers.slice(markers.length - 5)
            this.newestMarkerLayer.clearLayers();
            n.forEach(marker => {
                this.newestMarkerLayer.addLayer(marker);
            })
        })


        //case for user maker layer
        Observable.combineLatest(this.auth.user, this.markersBehaviorSubject)
            .subscribe(tuple => {
                const user = tuple[0];
                const markers = tuple[1];
                this.userMarkerLayer.clearLayers();
                if (user) {
                    markers.forEach(marker => {
                        const customMarkerOptions = marker.options as CustomMarkerOptions;
                        if (customMarkerOptions.document.uid === user.uid) {
                            marker.setIcon(LeafletUtils.createMarkerIcon("red"));
                            this.userMarkerLayer.addLayer(marker);
                        }
                    })
                }
            });


        this.mainMapService.mapCenterBehaviorSubject
            .subscribe(center => {
                if (this.map != null) {
                    this.map.setView(center, this.map.getZoom())
                }

            });

        this.auth.user.map(user => {
            let updatedLayersControl = null;
            if (user) {
                updatedLayersControl = {
                    overlays: {
                        'Meine Tickets anzeigen': this.userMarkerLayer,
                        'Neue Tickets': this.newestMarkerLayer
                    }
                }
            }
            else {
                updatedLayersControl = {
                    overlays: {
                        'Neue Tickets': this.newestMarkerLayer
                    }
                }
            }
            return updatedLayersControl;
        }).subscribe(this.layerControlsBehaviorSubject);

    }

    onMapReady(map: L.Map) {
        this.map = map;

        this.map.setView(
            this.mainMapService.mapCenterBehaviorSubject.getValue(),
            this.mainMapService.zoomLevelBehaviorSubject.getValue()
        );

        this.map.addControl(L.control.zoom({ position: 'bottomright' }));
        LeafletUtils.addGeoSearchControlToMap(this.map, GeoLocationService.apiKeyControlSearch);
        

        this.map.on('zoomend moveend, load', (event) => {
            //workaround
            this.mainMapService.mapCenterBehaviorSubject.next(this.map.getCenter());
            this.mainMapService.zoomLevelBehaviorSubject.next(this.map.getZoom());
            this.map.invalidateSize();
        });


        this.map.on('click', (e: any) => {
            // if the event's target class name is equal to material-icons, the user has clicked on the addTicket button and we can return.
            // if the url is equal to the url we wanna navigate to, there is no need to navigate
            if (e.originalEvent.target.className === "material-icons" || e.originalEvent.target.className === "btn btn-danger bmd-btn-fab" || this.router.url === '/start/overview') return;
            this.router.navigateByUrl('/start/overview');
        });


   

        this.addTicketControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },

            onAdd: () => {
                this.addTicketControlContainer.innerHTML = "<div class='leaflet-bar' style='cursor:pointer;'><a class='leaflet-touch leaflet-bar'><i class='material-icons' style='line-height:unset;'>my_location</i></a></div>";

                this.addTicketControlContainer.onclick = () => {
                    this.geoLocationService.getGeoLocationFromBrowser().subscribe(locationFromBrowser => {
                        if(locationFromBrowser !== null) {
                          const coordinates = L.latLng(locationFromBrowser.coords.latitude, locationFromBrowser.coords.longitude)
                          this.mainMapService.mapCenterBehaviorSubject.next(coordinates);
                          this.mainMapService.zoomLevelBehaviorSubject.next(this.defaultMapOptions.zoom);
                        } 
                      })
                    
                    //this.router.navigateByUrl('/addTicket');
                };

                this.addTicketControlContainer.ondblclick = () => {
                    this.map.doubleClickZoom.disable();
                };

                return this.addTicketControlContainer;
            }
        });

        this.map.addControl(new this.addTicketControl);
    }
}
