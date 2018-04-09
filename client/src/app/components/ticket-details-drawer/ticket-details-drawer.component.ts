import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import * as $ from 'jquery';
import { Ticket } from '../../models/ticket';
import { Observable } from 'rxjs/Observable';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-details-drawer',
  templateUrl: './ticket-details-drawer.component.html',
  styleUrls: ['./ticket-details-drawer.component.css']
})
export class TicketDetailsDrawerComponent implements OnInit {
  
  currentTicket : any;
  lastTicketId: string;
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private ticketService: TicketService) {
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      if(params && params.id !== 'overview'){
        this.open();
        if(this.lastTicketId === params.id) return;
        this.isLoading = true;
        this.lastTicketId = params.id;
        this.ticketService.getTicketById(params.id).snapshotChanges().map( actions => {
          const data = actions.payload.data() as Ticket;
          const id = actions.payload.id;
          return { id, ...data };
        })
        .subscribe(ticket => {
          this.currentTicket = ticket;
          this.isLoading = false;
        })
      }else{
        this.close();
      }
    });
  }

  ngOnChanges(changes) {
  }

  close() {
    $('#details-drawer').attr('class', 'details-drawer');
  }

  open() {
    $('#details-drawer').addClass('details-drawer-in');
  }

  private getImgUrl(image){
    let domain = 'https://firebasestorage.googleapis.com/v0/b/fix-munich.appspot.com/o/';
    let noDataImageName = 'no_images_available.jpg';
    let noDataImageUrl = 'url(' + domain + noDataImageName + '?alt=media' + ')'; 
    if(image.name){
        return 'url(' + domain + image.name + '?alt=media' + ')';  
    }else{
        return noDataImageUrl;
    }
  }
}
