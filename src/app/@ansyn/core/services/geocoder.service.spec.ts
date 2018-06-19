import { TestBed, inject } from '@angular/core/testing';

import { GeocoderService } from './geocoder.service';

describe('GeocoderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeocoderService]
    });
  });

  it('should be created', inject([GeocoderService], (service: GeocoderService) => {
    expect(service).toBeTruthy();
  }));
});
