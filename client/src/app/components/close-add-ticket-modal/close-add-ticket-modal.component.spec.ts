import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAddTicketModalComponent } from './close-add-ticket-modal.component';

describe('CloseAddTicketModalComponent', () => {
  let component: CloseAddTicketModalComponent;
  let fixture: ComponentFixture<CloseAddTicketModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseAddTicketModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseAddTicketModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
