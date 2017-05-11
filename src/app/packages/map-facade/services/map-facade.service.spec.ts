import { TestBed, inject } from '@angular/core/testing';

import { MapFacadeService } from './map-facade.service';

describe('MapFacadeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapFacadeService]
    });
  });

  it('should ...', inject([MapFacadeService], (service: MapFacadeService) => {
    expect(service).toBeTruthy();
  }));
});
