import { CoreModule } from '@ansyn/core';
import { TestBed, inject } from '@angular/core/testing';
import { CasesService } from './cases.service';
import { HttpModule } from "@angular/http";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Case } from '../models/case.model';

describe('CasesService', () => {
	let casesService: CasesService;
	let http: Http;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports:[HttpModule, CoreModule.forRoot(null)],
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

	it('createCase should send the case as body in ajax("post")', () => {
		let fake_response = {json: () => selected_case};
		spyOn(http, 'post').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
		let selected_case: Case = {id: 'faker_id', name: 'faker_name'};
		casesService.createCase(selected_case);
		expect(http.post).toHaveBeenCalledWith(`${casesService.base_url}`, JSON.stringify(selected_case), new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
	});

	it('updateCase should send the case as body in ajax("put")', () => {
		let selected_case: Case = {id: 'faker_id', name: 'faker_other_name'};
		let fake_response = {json: () => selected_case};
		spyOn(http, 'put').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
		casesService.updateCase(selected_case);
		expect(http.put).toHaveBeenCalledWith(`${casesService.base_url}`, JSON.stringify(selected_case), new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
	});

	it('updateCase should send the case id as param in ajax("delete")', () => {
		let selected_case: Case = {id: 'faker_id', name: 'faker_other_name'};
		let case_id_to_remove = selected_case.id;
		let fake_response = {json: () => selected_case};
		spyOn(http, 'delete').and.callFake(() => new Object({map: (callBack) => callBack(fake_response)}));
		casesService.removeCase('faker_id');
		expect(http.delete).toHaveBeenCalledWith(`${casesService.base_url}/${case_id_to_remove}`, new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' })}));
	});



});
