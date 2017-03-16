import { TestBed, inject } from '@angular/core/testing';
import {AppDataService} from "./app-data.service";
import {MenuService} from "../menu/menu.service";


describe('AppDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppDataService, MenuService]
    });
  });

  it('should ...', inject([AppDataService], (service: AppDataService) => {
    expect(service).toBeTruthy();
  }));
});
