import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from "@angular/http";
import { DataLayersService } from './data-layers.service';

describe('DataLayersServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [DataLayersService]
    });
  });

  it('should ...', inject([DataLayersService], (service: DataLayersService) => {
    expect(service).toBeTruthy();
  }));
});
