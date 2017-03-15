import { TestBed, inject } from '@angular/core/testing';
import {AppDataService} from "./app-data.service";


describe('AppDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppDataService]
    });
  });

  it('should ...', inject([AppDataService], (service: AppDataService) => {
    expect(service).toBeTruthy();
  }));
});
