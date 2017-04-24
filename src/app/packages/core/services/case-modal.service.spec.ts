import { TestBed, inject } from '@angular/core/testing';
import { CaseModalService } from './case-modal.service';
import { CoreModule } from '../core.module';
import { HttpModule } from '@angular/http';
import { CasesService } from './cases.service';
import { Case } from '../models/case.model';

describe('CaseModalService', () => {
  let caseModalService: CaseModalService;
  let casesService: CasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule, CoreModule]
    });
  });

  beforeEach(inject([CaseModalService, CasesService], (_caseModalService: CaseModalService, _casesService: CasesService) => {
    caseModalService = _caseModalService;
    casesService = _casesService;
  }));

  it('should be defined', () => {
    expect(caseModalService).toBeDefined();
  });

  it('show modal should call closeModal, save case_id and call onShow.emit with component', () => {
    spyOn(caseModalService, 'closeModal');
    spyOn(caseModalService.onShow, 'emit');
    let fake_case_id: string = 'this_is_fake_case_id';
    let fake_component: any = 'this_is_fake_component';
    caseModalService.showModal(fake_component, fake_case_id);
    expect(caseModalService.closeModal).toHaveBeenCalled();
    expect(caseModalService.onShow.emit).toHaveBeenCalledWith({component: fake_component});
    expect(caseModalService.case_id).toEqual(fake_case_id);
  });

  it('closeModal should set case_id with undefined and call onClose.emit', () => {
    spyOn(caseModalService.onClose, 'emit');
    caseModalService.closeModal();
    expect(caseModalService.case_id).toBeUndefined();
    expect(caseModalService.onClose.emit).toHaveBeenCalled();
  });

  it('getSelectedCase should return the selected_case by case_id or new case ("getEmptyCase()")', () => {
    casesService.cases = [
      {id: 'id1', name:'case1'},
      {id: 'id2', name:'case2'},
    ];
    caseModalService.case_id = 'id1';
    expect(caseModalService.getSelectedCase()).toEqual(casesService.cases[0]);
    caseModalService.case_id = undefined;
    expect(caseModalService.getSelectedCase()).toEqual(caseModalService.getEmptyCase());
  });

  it('isCaseActive should get case and return if case_id equal to input case', () => {
    caseModalService.case_id = 'id1';
    let selected_case: Case = {id: 'id1', name:'case1'};
    expect(caseModalService.isCaseActive(selected_case)).toBeTruthy();
    caseModalService.case_id = 'id2';
    expect(caseModalService.isCaseActive(selected_case)).toBeFalsy();
  });

});
