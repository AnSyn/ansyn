import { inject, TestBed } from '@angular/core/testing';
import { CasesService } from './cases.service';
import { Headers, RequestOptions } from '@angular/http';
import { Case } from '../models/case.model';
import { casesConfig } from '@ansyn/menu-items/cases';
import { UrlSerializer } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export const MockCasesConfig = {
	provide: casesConfig,
	useValue: {
		defaultCase: {
			name: 'default name',
			id: 'default id',
			state: {
				time: {}
			}
		},
		baseUrl: 'fake-cases-url',
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region']

	}
} as any;

describe('CasesService', () => {
	let casesService: CasesService;
	let http: HttpClient;

	const defaultCase: Case = {
		name: 'default name',
		id: 'default id',
		state: {
			time: {}
		}

	} as any;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CasesService, UrlSerializer, MockCasesConfig]
		});
	});

	beforeEach(inject([CasesService, HttpClient], (_casesService: CasesService, _http: HttpClient) => {
		casesService = _casesService;
		http = _http;
	}));

	it('should be defined', () => {
		expect(casesService).toBeDefined();
	});

	it('function getOveralysMarkup ', () => {
		const testCase = {
			state: {
				maps: {
					active_map_id: '333',
					data: [
						{
							id: '333',
							data: {
								overlay: {
									id: '333-a'
								}
							}
						},
						{
							id: '444',
							data: {
								overlay: {
									id: '444-a'
								}
							}
						},
						{
							id: '5555',
							data: {}
						}
					]
				}
			}
		} as any;
		const result = CasesService.getOverlaysMarkup(testCase);
		expect(result.length).toBe(2);
		expect(result[0].class).toBe('active');
		expect(result[1].class).toBe('displayed');
	});

	it('createCase should send the case as body in ajax("post")', () => {
		let selected_case: Case = { id: 'faker_id', name: 'faker_name' };
		let fake_response = { selected_case };
		spyOn(http, 'post').and.callFake(() => ({ map: (callBack) => callBack(fake_response) }));
		casesService.createCase(selected_case);
		let fake_response = { json: () => selected_case };
		spyOn(http, 'post').and.callFake(() => ({ map: (callBack) => callBack(fake_response) }));
		expect(http.post).toHaveBeenCalledWith(`${casesService.base_url}`, selected_case);
	});

	it('updateCase should send the case as body in ajax("put")', () => {
		let selected_case: Case = { id: 'faker_id', name: 'faker_other_name' };
		let fake_response = { selected_case };
		spyOn(http, 'put').and.callFake(() => ({ map: (callBack) => callBack(fake_response) }));
		casesService.updateCase(selected_case);
		expect(http.put).toHaveBeenCalledWith(`${casesService.base_url}`, selected_case);
	});

	it('updateCase should send the case id as param in ajax("delete")', () => {
		let selected_case: Case = { id: 'faker_id', name: 'faker_other_name' };
		let case_id_to_remove = selected_case.id;
		let fake_response = { selected_case };
		spyOn(http, 'delete').and.callFake(() => ({ map: (callBack) => callBack(fake_response) }));
		casesService.removeCase('faker_id');
		expect(http.delete).toHaveBeenCalledWith(`${casesService.base_url}/${case_id_to_remove}`);
	});

	it('loadContexts should send the all contexts from ajax("get")', () => {
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadContexts();
		expect(http.get).toHaveBeenCalledWith(`${casesService.base_url}/contexts`);
	});

	it('loadCase should get single case from ajax("get")', () => {
		const case_id = '12345';
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadCase(case_id);
		expect(http.get).toHaveBeenCalledWith(`${casesService.base_url}/${case_id}`);
	});

	it('getDefaultCase should return cloned defaultCase from config ', () => {
		const defaultCaseRes = casesService.getDefaultCase();
		expect(defaultCaseRes.id).toEqual(defaultCase.id);
		expect(defaultCaseRes.name).toEqual(defaultCase.name);
		expect(defaultCaseRes.state.time.to).toBeTruthy();
		expect(defaultCaseRes.state.time.from).toBeTruthy();
	});

});
