import { TestBed, inject } from '@angular/core/testing';

import { RouterStoreHelperService } from './router-store-helper.service';

describe('RouterStoreHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RouterStoreHelperService]
    });
  });

  it('should be created', inject([RouterStoreHelperService], (service: RouterStoreHelperService) => {
    expect(service).toBeTruthy();
  }));
});
