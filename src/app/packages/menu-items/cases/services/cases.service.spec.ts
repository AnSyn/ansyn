import { TestBed, inject } from '@angular/core/testing';
import { CasesService } from './cases.service';
import { HttpModule } from "@angular/http";
import { Case } from "../../../core/models/case.model";
import { Http, Headers, RequestOptions } from "@angular/http";

describe('CasesService', () => {
  let casesService: CasesService;
  let http: Http;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpModule],
      providers: [CasesService]
    });
  });

  beforeEach(inject([CasesService, Http], (_casesService: CasesService, _http: Http) => {
    casesService = _casesService;
    http = _http;
  }));

  it('should be defined', () => {
    expect(casesService).toBeDefined();
  });

  it('selectCase should get case and put case.id on selected_case_id', () => {
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id};
    casesService.selectCase(fake_case);
    expect(casesService.selected_case_id).toEqual(id);
  });


  it('isCaseSelected should equal between case.id and selected_case_id', () => {
    let id = `fake_id_blblblblblb`;
    let fake_case: Case = {id};
    casesService.selected_case_id = `not!!!fake_id_blblblblblb`;
    expect(casesService.isCaseSelected(fake_case)).toBeFalsy();
    casesService.selected_case_id = id;
    expect(casesService.isCaseSelected(fake_case)).toBeTruthy();
  });

  it('createCase should get case and send the case as body in ajax("post"), result should unshift to cases and call caseAdded.emit', () => {
    spyOn(casesService.caseAdded, 'emit');
    let selected_case: Case = {id: 'faker_id', name: 'faker_name'};
    let fake_response = {json: () => selected_case};
    spyOn(http, 'post').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
    casesService.createCase(selected_case);
    expect(http.post).toHaveBeenCalledWith(`${casesService.base_url}`, JSON.stringify(selected_case), new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
    expect(casesService.cases[0]).toEqual(selected_case);
    expect(casesService.caseAdded.emit).toHaveBeenCalledWith(selected_case);
  });

  it('updateCase should get case and send the case as body in ajax("put"), result should update the selected case on cases', () => {
    casesService.cases = [{id: 'faker_id', name: 'faker_name'}];
    let selected_case: Case = {id: 'faker_id', name: 'faker_other_name'};
    let fake_response = {json: () => selected_case};
    spyOn(http, 'put').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
    casesService.updateCase(selected_case);
    expect(http.put).toHaveBeenCalledWith(`${casesService.base_url}`, JSON.stringify(selected_case), new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
    expect(casesService.cases[0]).toEqual(selected_case);
  });

  it('removeCase should get case_id and send case_id as body in ajax("delete"), result should update the selected case on cases. loadCases() should have been call if cases count is less then LIMIT', () => {
    //count = 3
    casesService.cases = [{id: 'faker_id', name: 'faker_name'}, {id: 'faker_id2', name: 'faker_name'}, {id: 'faker_id3', name: 'faker_name'}];
    casesService.LIMIT = 3;
    let case_id_to_remove = casesService.cases[0].id;
    let fake_response = {json: () => casesService.cases[0]};
    spyOn(http, 'delete').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
    spyOn(casesService, 'loadCases');
    casesService.removeCase('faker_id');
    expect(http.delete).toHaveBeenCalledWith(`${casesService.base_url}/${case_id_to_remove}`, new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
    //count = 2
    expect(casesService.cases.length).toEqual(2);
    //count = 2 < limit = 3
    expect(casesService.loadCases).toHaveBeenCalled();
  });

  it('getLastId should take last the last case_id from cases', () => {
    casesService.cases = [{id:'case_id1'}, {id:'case_id2'}, {id:'case_id3_last'}];
    expect(casesService.getLastId()).toEqual('case_id3_last');
  });



});
