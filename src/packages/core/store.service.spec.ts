import { TestBed, inject } from '@angular/core/testing';
import {StoreService} from "./store.service";
import {MenuService} from "./services/menu.service";


describe('AppDataService', () => {

  let storeService:StoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StoreService, MenuService]
    });
  });
  beforeEach(inject([StoreService], (_storeService: StoreService) => {
    storeService = _storeService;
  }));

  it('should ...', () => {
    expect(storeService).toBeTruthy();
  });
});
