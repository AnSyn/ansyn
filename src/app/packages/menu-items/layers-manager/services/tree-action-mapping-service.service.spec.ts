import { TestBed, inject } from '@angular/core/testing';

import { TreeActionMappingServiceService } from './tree-action-mapping-service.service';

describe('TreeActionMappingServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreeActionMappingServiceService]
    });
  });

  it('should ...', inject([TreeActionMappingServiceService], (service: TreeActionMappingServiceService) => {
    expect(service).toBeTruthy();
  }));
});
