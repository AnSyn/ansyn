import { TestBed, inject } from '@angular/core/testing';

import { LoginConfigService } from './login-config.service';

describe('LoginConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginConfigService]
    });
  });

  it('should be created', inject([LoginConfigService], (service: LoginConfigService) => {
    expect(service).toBeTruthy();
  }));
});
