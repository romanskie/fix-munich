import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import * as firebase from 'firebase';
import { Category, Ticket } from '../../models/ticket';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from "@angular/router";
import LeafletUtils from '../../utils/LeafletUtils';
import * as L from 'leaflet';
import { CurrentLocationFromImageUploadService } from '../../services/current-location-from-image-upload.service';
import { MainMapService } from '../../services/main-map.service';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  activeCategoriesFilters: Category[] = [];

  tickets$: Observable<any>;
  ticketCollection: AngularFirestoreCollection<Ticket>;

  categories: Observable<any>;
  categoryCollection: AngularFirestoreCollection<Category>;

  sortBy$: BehaviorSubject<string | null>;
  categoriesFilter$: BehaviorSubject<object[] | null>;

  spinnerShowing: boolean;

  ticketType: string = '';

  constructor(db: AngularFirestore, private mainMapService: MainMapService, private loadingSpinnerService: LoadingSpinnerService, private router: Router, private route: ActivatedRoute) {
    this.sortBy$ = new BehaviorSubject('desc');
    this.categoriesFilter$ = new BehaviorSubject(null);
    this.loadingSpinnerService.show('ticketDetailsSpinner');
    let collectionString = this.router.url === '/tickets' ? 'tickets' : 'unapprovedTickets';
    this.ticketType = this.router.url;
    this.tickets$ = Observable.combineLatest(
        this.sortBy$,
        this.categoriesFilter$
      ).switchMap(([sortBy, categories]) => {
        //this.loadingSpinnerService.show('filterTicketsSpinner');
        return db.collection(collectionString, ref => {
          let query : firebase.firestore.Query = ref;
          let sorting : firebase.firestore.OrderByDirection = sortBy === 'asc' ? 'asc' : 'desc';
  
          if(sortBy) {
            query = query.orderBy('createdAt', sorting)
          };
  
          if (categories && categories.length <= 1) {
            categories.forEach(cat => {
              query = query.where('categoriesQuery.' + cat['id'], "==", true) 
            })
          }
  
          return query;
        })
        .snapshotChanges()
        .map(this._mapDocuments)
    });

    //load categories
    this.categoryCollection = db.collection<Category>('categories', ref => {
      let query : firebase.firestore.Query = ref;
      query = query.orderBy('name', 'asc');
      return query;
    });
    this.categories = this.categoryCollection.snapshotChanges().map(this._mapDocuments);
  }

  private _mapDocuments(actions) {
    return actions.map(a => {
      const data = a.payload.doc.data() as Ticket;
      const id = a.payload.doc.id;
      return { id, ...data };
    });
  }

  sortBy() {
    let sortOrder = this.sortBy$.value === 'asc' ? 'desc' : 'asc';
    this.sortBy$.next(sortOrder);
  }

  filterCategory(filter: Category){
    const newFilter = {type: 'category', ...filter};
    this.activeCategoriesFilters.push(newFilter);
    this.categoriesFilter$.next(this.activeCategoriesFilters);
  }

  removeFilter(deletedFilter){
    if(deletedFilter.type === 'category'){
      this.activeCategoriesFilters.forEach((activeFilter, i) => {
        if(activeFilter.id === deletedFilter.id){
          this.activeCategoriesFilters.splice(i, 1);
          this.categoriesFilter$.next(this.activeCategoriesFilters);
        }
      })
    }
  }

  isFilterActive(filter, type) {
    let res = filter;
    const id = filter.id;

    if(type === 'category'){
      this.activeCategoriesFilters.forEach(function (activeFilter) {
        if(activeFilter.id === id){
          res = null;
        }
      });  
    }
    
    return res;
  }

  jumpToTicketMarker = (ticket: Ticket) => {
    const position = L.latLng(ticket.position[0], ticket.position[1]);
    this.mainMapService.mapCenterBehaviorSubject.next(position)
    this.router.navigateByUrl('/start/' + ticket.id);
  }

  getThumbnailUrl(ticket){
    let domain = 'https://firebasestorage.googleapis.com/v0/b/fix-munich.appspot.com/o/thumb_';
    let noDataImageName = 'no_images_available.jpg';
    let noDataImageUrl = domain + noDataImageName + '?alt=media';

    if(ticket.images && ticket.images.length > 0){
      const image = ticket.images[0];
      if(image.name){
        return domain + image.name + '?alt=media';  
      }else{
        return noDataImageUrl;
      }
    }else{
      return noDataImageUrl;
    }
  }

  ngOnInit() {
  }
}

