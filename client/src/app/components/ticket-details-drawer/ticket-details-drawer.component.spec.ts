import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDetailsDrawerComponent } from './ticket-details-drawer.component';

describe('TicketDetailsDrawerComponent', () => {
  let component: TicketDetailsDrawerComponent;
  let fixture: ComponentFixture<TicketDetailsDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketDetailsDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketDetailsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
