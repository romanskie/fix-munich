import { TestBed, inject } from '@angular/core/testing';

import { CurrentLocationFromImageUploadService } from './current-location-from-image-upload.service';

describe('CurrentLocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrentLocationFromImageUploadService]
    });
  });

  it('should be created', inject([CurrentLocationFromImageUploadService], (service: CurrentLocationFromImageUploadService) => {
    expect(service).toBeTruthy();
  }));
});
