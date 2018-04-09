import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeafletTicketSummaryMapComponent } from './leaflet-ticket-summary-map.component';

describe('LeafletMapComponent', () => {
  let component: LeafletTicketSummaryMapComponent;
  let fixture: ComponentFixture<LeafletTicketSummaryMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeafletTicketSummaryMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeafletTicketSummaryMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
