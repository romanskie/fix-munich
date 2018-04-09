import { Injectable, NgZone } from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged } from 'rxjs/operators';
import LeafletUtils from '../utils/LeafletUtils';
import { GeoLocationService } from './geo-location-service.service';
import { TicketService } from './ticket.service';
import { Ticket } from '../models/ticket';
import { AuthService } from '../core/auth.service';
import { CustomMarkerOptions } from '../models/customMarkerOptions';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

@Injectable()
export class MainMapService {

  public static defaultMapCenterCoords = L.latLng(48.140330, 11.564407);
  readonly mapCenterBehaviorSubject = new BehaviorSubject<L.LatLng>(MainMapService.defaultMapCenterCoords);
  readonly zoomLevelBehaviorSubject = new BehaviorSubject<number>(15);

  readonly markerCountBehaviorSubject = new BehaviorSubject<number>(0);

  readonly ticketsBehaviorSubject = new BehaviorSubject<Ticket[]>([]);


  constructor(private ticketService: TicketService, private auth: AuthService, private router: Router, private ngZone: NgZone) {

    this.ticketService
      .getTicketCollection()
      .snapshotChanges()
      .map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data() as Ticket;
          const id = action.payload.doc.id;
          return { id, ...data };
        })
      })
      .subscribe(this.ticketsBehaviorSubject);


      this.ticketsBehaviorSubject
      .map(markerArray => markerArray.length)
      .subscribe(this.markerCountBehaviorSubject);




  }

  ngOnInit() {

  }



}