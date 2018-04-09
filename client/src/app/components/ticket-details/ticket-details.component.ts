import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import * as L from 'leaflet';
import { latLng, tileLayer, marker, icon, LeafletEvent } from 'leaflet';
import { AuthService } from '../../core/auth.service';
import { TicketService } from '../../services/ticket.service';
import * as _ from 'lodash'
import { Subscription } from 'rxjs/Subscription';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { Ticket } from '../../models/ticket';
import { EROFS } from 'constants';
import { Router } from '@angular/router';
import { CurrentLocationFromImageUploadService } from '../../services/current-location-from-image-upload.service';
import LeafletUtils from '../../utils/LeafletUtils';
import { LeafletDirective } from '@asymmetrik/ngx-leaflet/dist/leaflet/core/leaflet.directive';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {

  ticketDoc: AngularFirestoreDocument<Ticket>;
  ticketSub: Subscription;
  ticket: Ticket;
  ticketId: string;
  isEdit: boolean = false;

  options;
  layers;
  layersControl;

  readonly mapZoomLvl: number = 12;
  readonly mapMaxZoomLvl: number = 18;
  readonly mapCenterCoords: L.LatLng = L.latLng(48.140330, 11.564407);
  readonly tileLayerUrl: string = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  map: L.Map = null;
  markerLayer: L.LayerGroup = new L.LayerGroup();

  userRoles: Array<string>; // roles of currently logged in uer

  spinnerShowing: boolean;

  showAlert: boolean = false;
  isAlertError: boolean = false;
  alertName: string = '';
  alertMessage: string = '';

  ticketType: string = '';

  constructor(private currentLocationFromImageUploadService: CurrentLocationFromImageUploadService, private db: AngularFirestore, private route: ActivatedRoute, 
              private authService: AuthService, private loadingSpinnerService: LoadingSpinnerService, private router: Router,
              private ticketService: TicketService) {
    this.route.params.subscribe(params => {

      this.ticketType = params.type;
      this.loadingSpinnerService.show('ticketDetailsSpinner');
      this.ticketId = params.id;
      this.ticketDoc = db.doc<Ticket>(this.ticketType + '/' + this.ticketId);
      this.ticketSub = this.ticketDoc.snapshotChanges().map(this._mapTicketsForMarkers).subscribe(res => {
        this.ticket = res;
      });

    });

    authService.user.map(user => {
      /// Set an array of user roles, ie ['isAdmin', 'isReader', ...]
      if(user){
        return this.userRoles = _(user.role).pickBy().keys().value();
      }else{
        return this.userRoles = [];
      }
    })
    .subscribe()

  }

  ngOnInit() {
    this.options = {
      layers: [
        tileLayer(this.tileLayerUrl, { maxZoom: this.mapMaxZoomLvl, attribution: '...' }),
        this.markerLayer
      ],
      zoom: this.mapZoomLvl,
      zoomControl: false,
      center: this.mapCenterCoords,
      doubleClickZoom: false,
    };
  }

  delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private _mapTicketsForMarkers(actions) {
    return actions.payload.data();
  }

  onMapReady(map: L.Map) {
    this.map = map;
    LeafletUtils.disableMapTouch(this.map);
    const marker = LeafletUtils.createCustomMarker(L.latLng(this.ticket.position[0],this.ticket.position[1]), { icon: LeafletUtils.createMarkerIcon("red"), clickable: false, draggable: false }, null)
    this.markerLayer.addLayer(marker);
    LeafletUtils.centerLocation(this.map, marker.getLatLng(), 15);

  }

  private getImgUrl(image) {
    let domain = 'https://firebasestorage.googleapis.com/v0/b/fix-munich.appspot.com/o/';
    let noDataImageName = 'no_images_available.jpg';
    let noDataImageUrl = domain + noDataImageName + '?alt=media';
    if (image.name) {
      return domain + image.name + '?alt=media';
    } else {
      return noDataImageUrl;
    }
  }

  ///// Authorization Logic /////
  private isAdmin() {
    const allowed = ['isAdmin']
    return this.matchingRole(allowed)
  }

  /// Helper to determine if any matching roles exist
  private matchingRole(allowedRoles): boolean {
    return !_.isEmpty(_.intersection(allowedRoles, this.userRoles))
  }

  private determineStatusBtnLabel(state: string): string {
    let label = '';
    switch (state) {
      case 'Warten auf Freigabe':
        label = 'Meldung freigeben';
        break;
      case 'freigegeben':
        label = 'Meldung wird bearbeitet';
        break;
      case 'in Bearbeitung':
        label = 'Meldung wurde behoben';
      default:
        break;
    }
    return label;
  }

  private changeTicketState() {
    this.loadingSpinnerService.show('ticketDetailsSpinner');
    let newState = '';
    switch (this.ticket.state) {
      case 'Warten auf Freigabe':
        newState = 'freigegeben';
        break;
      case 'freigegeben':
        newState = 'in Bearbeitung';
        break;
      case 'in Bearbeitung':
        newState = 'behoben';
        break;
      default:
        break;
    }

    // if ticket state equals 'Warten auf Freigabe', we are on ticketDetails unreviewed view: create new ticket in ticket collection and delete ticket from unapprovedTicketCollection
    if(this.ticket.state === 'Warten auf Freigabe'){
      this.ticketService.addTicket({...this.ticket, state: newState})
      .then(ticket => {
        this.ticketService.deleteUnapprovedTicket(this.ticketId)
          .then(ticket => {
            this.router.navigateByUrl('/unapprovedTickets');
            this.loadingSpinnerService.hide('ticketDetailsSpinner');
          })
          .catch(err => {
            console.log(err);
            this.loadingSpinnerService.hide('ticketDetailsSpinner');
          })
      })
      .catch(err => {
        console.log(err);
        this.showAlert = true;
        this.isAlertError = true;
        this.alertName = err.name;
        this.alertMessage = err.message;
        this.loadingSpinnerService.hide('ticketDetailsSpinner');
      })
    }
    //else just update ticket status
    else{
      this.ticketDoc.update({ ...this.ticket, state: newState })
      .then(doc => {
        this.showAlert = true;
        this.isAlertError = false;
        this.alertName = 'Statusänderung erfolgreich';
        this.alertMessage = 'Der Status der Meldung wurde erfolgreich aktualisiert';
        this.loadingSpinnerService.hide('ticketDetailsSpinner');
      })
      .catch(err => {
        this.showAlert = true;
        this.isAlertError = true;
        this.alertName = err.name;
        this.alertMessage = err.message;
        this.loadingSpinnerService.hide('ticketDetailsSpinner');
        throw new Error(err);
      })
    }
  }

  private deleteTicket() {
    this.loadingSpinnerService.show('ticketDetailsSpinner');
    this.ticketDoc.delete()
      .then(doc => {
        this.router.navigateByUrl('/' + this.ticketType);
      })
      .catch(err => {
        this.showAlert = true;
        this.isAlertError = true;
        this.alertName = err.name;
        this.alertMessage = err.message;
        this.loadingSpinnerService.hide('ticketDetailsSpinner');
      })
  }


}

export interface Ticket {
  description: string;
}

