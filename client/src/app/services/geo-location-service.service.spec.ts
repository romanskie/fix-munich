import { TestBed, inject } from '@angular/core/testing';
import { GeoLocationService } from './geo-location-service.service';


describe('GeoLocationServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeoLocationService]
    });
  });

  it('should be created', inject([GeoLocationService], (service: GeoLocationService) => {
    expect(service).toBeTruthy();
  }));
});
