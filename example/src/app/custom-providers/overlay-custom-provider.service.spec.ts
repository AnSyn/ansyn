import { TestBed, inject } from '@angular/core/testing';

import { OverlayCustomProviderService } from './overlay-custom-provider.service';

describe('OverlayCustomProviderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OverlayCustomProviderService]
    });
  });

  it('should be created', inject([OverlayCustomProviderService], (service: OverlayCustomProviderService) => {
    expect(service).toBeTruthy();
  }));
});
