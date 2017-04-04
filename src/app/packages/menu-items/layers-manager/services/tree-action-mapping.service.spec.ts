import { TestBed, inject } from '@angular/core/testing';

import { TreeActionMappingService } from './tree-action-mapping.service';

describe('TreeActionMappingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TreeActionMappingService]
    });
  });

  it('should ...', inject([TreeActionMappingService], (service: TreeActionMappingService) => {
    expect(service).toBeTruthy();
  }));
});
