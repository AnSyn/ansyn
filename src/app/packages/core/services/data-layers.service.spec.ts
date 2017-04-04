import { TestBed, inject } from '@angular/core/testing';

import { DataLayersService } from './data-layers.service';

describe('DataLayersServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataLayersService]
    });
  });

  it('should ...', inject([DataLayersService], (service: DataLayersService) => {
    expect(service).toBeTruthy();
  }));
});
