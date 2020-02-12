import { TestBed } from '@angular/core/testing';

import { BaseMapProvidersService } from './base-map-providers.service';

describe('BaseMapProvidersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BaseMapProvidersService = TestBed.get(BaseMapProvidersService);
    expect(service).toBeTruthy();
  });
});
