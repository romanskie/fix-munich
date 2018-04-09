import { Injectable } from '@angular/core';
import { Category, Ticket } from '../models/ticket';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { merge } from 'rxjs/observable/merge';
import { zip } from 'rxjs/observable/zip';
import { of } from 'rxjs/observable/of';

@Injectable()
export class  TicketService {

  private unapprovedTicketCollection: AngularFirestoreCollection<Ticket>;
  private unapprovedTickets: Observable<Ticket[]>;

  private ticketCollection: AngularFirestoreCollection<Ticket>;
  private tickets: Observable<Ticket[]>;

  private categoryCollection: AngularFirestoreCollection<Category>;
  private categories: Observable<any[]>;

  constructor(private db: AngularFirestore) {
    this.categoryCollection = this.db.collection<Category>('categories', ref => {
      let query: firebase.firestore.Query = ref;
      query = query.orderBy('name', 'asc');
      return query;
    });
    this.categories = this.categoryCollection.snapshotChanges().map(this._mapDocuments);

    this.unapprovedTicketCollection = this.db.collection<Ticket>('unapprovedTickets');
    this.ticketCollection = this.db.collection<Ticket>('tickets');

    this.unapprovedTickets = this.unapprovedTicketCollection.valueChanges();
    this.tickets = this.ticketCollection.valueChanges();
  }

  getTicketById = (ticketId: string) => {
    let ticketDoc = this.db.doc<Ticket>('tickets/' + ticketId);
    return ticketDoc;
  }

  getunapprovedTicketById = (ticketId: string) => {
    let ticketDoc = this.db.doc<Ticket>('unapprovedTickets/' + ticketId);
    return ticketDoc;
  }

  getTickets = () => {
    return this.tickets;
  }

  getUnapprovedTickets = () => {
    return this.unapprovedTickets;
  }

  getTicketCollection = () => {
    return this.ticketCollection;
  }

  getUnapprovedTicketCollection = () => {
    return this.getUnapprovedTicketCollection;
  }

  addTicket = (ticket: Ticket) => {
    return this.ticketCollection.add(ticket)
  }

  updateTicket = (ticketId: string, update: Ticket) => {
    this.ticketCollection.doc(ticketId).update(update)
  }

  deleteTicket = (ticketId: string) => {
    this.ticketCollection.doc(ticketId).delete()
  }

  addUnapprovedTicket = (ticket: Ticket) => {
    this.unapprovedTicketCollection.add(ticket)
  }

  updateUnapprovedTicket = (ticketId: string, update: Ticket) => {
    this.unapprovedTicketCollection.doc(ticketId).update(update)
  }

  deleteUnapprovedTicket = (ticketId: string) => {
    return this.unapprovedTicketCollection.doc(ticketId).delete()
  }

  getTicketCategories = () => {
    return this.categories;
  }


  private _mapDocuments(actions) {
    return actions.map(a => {
      const data = a.payload.doc.data() as Ticket;
      const id = a.payload.doc.id;
      return { id, ...data };
    });
  }
}