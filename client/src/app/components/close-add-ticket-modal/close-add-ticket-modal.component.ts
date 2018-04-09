import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import 'bootstrap';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-close-add-ticket-modal',
  templateUrl: './close-add-ticket-modal.component.html',
  styleUrls: ['./close-add-ticket-modal.component.css']
})
export class CloseAddTicketModalComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private router: Router) { }

  ngOnInit() {
  }

  goToStartOverview = () => {
    this.router.navigateByUrl('/start/overview');
}

  show = () => {
    $('#closeAddTicketModal').modal('show');
  }

  hide = () => {
    $('#closeAddTicketModal').modal('hide');
  }



}

 
