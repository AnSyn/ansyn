import { TestBed, inject } from '@angular/core/testing';

import { CasesService } from './cases.service';
import {HttpModule} from "@angular/http";

describe('CasesService', () => {
  let casesService:CasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule],
      providers: [CasesService]
    });
  });

  beforeEach(inject([CasesService], (_casesService: CasesService) => {
    casesService = _casesService;
  }));

  it('should be defined', () => {
    expect(casesService).toBeDefined();
  });

});
