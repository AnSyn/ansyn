import { TestBed, inject } from '@angular/core/testing';

import { GoToService } from './go-to.service';

describe('GoToService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoToService]
    });
  });

  it('should be created', inject([GoToService], (service: GoToService) => {
    expect(service).toBeTruthy();
  }));
});
