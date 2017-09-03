import { TestBed, inject } from '@angular/core/testing';

import { AnsynRouterService } from './router.service';

describe('RouterFacadeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnsynRouterService]
    });
  });

  it('should be created', inject([AnsynRouterService], (service: AnsynRouterService) => {
    expect(service).toBeTruthy();
  }));
});
