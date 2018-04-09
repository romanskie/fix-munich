import { TestBed, inject } from '@angular/core/testing';

import { MainMapService } from './main-map.service';

describe('MainMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MainMapService]
    });
  });

  it('should be created', inject([MainMapService], (service: MainMapService) => {
    expect(service).toBeTruthy();
  }));
});
