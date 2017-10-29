import { inject, TestBed } from '@angular/core/testing';
import { CasesService } from './cases.service';
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
					activeMapId: '333',
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
		let selectedCase: Case = { id: 'fakerId', name: 'fakerName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'post').and.callFake(() => ({ map: (callBack) => callBack(fakeResponse) }));
		casesService.createCase(selectedCase);
		expect(http.post).toHaveBeenCalledWith(`${casesService.baseUrl}`, selectedCase);
	});

	it('updateCase should send the case as body in ajax("put")', () => {
		let selectedCase: Case = { id: 'fakerId', name: 'fakerOtherName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'put').and.callFake(() => ({ map: (callBack) => callBack(fakeResponse) }));
		casesService.updateCase(selectedCase);
		expect(http.put).toHaveBeenCalledWith(`${casesService.baseUrl}`, selectedCase);
	});

	it('updateCase should send the case id as param in ajax("delete")', () => {
		let selectedCase: Case = { id: 'fakerId', name: 'fakerOtherName' };
		let caseIdToRemove = selectedCase.id;
		let fakeResponse = { selectedCase };
		spyOn(http, 'delete').and.callFake(() => ({ map: (callBack) => callBack(fakeResponse) }));
		casesService.removeCase('fakerId');
		expect(http.delete).toHaveBeenCalledWith(`${casesService.baseUrl}/${caseIdToRemove}`);
	});

	it('loadContexts should send the all contexts from ajax("get")', () => {
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadContexts();
		expect(http.get).toHaveBeenCalledWith(`${casesService.baseUrl}/contexts`);
	});

	it('loadCase should get single case from ajax("get")', () => {
		const caseId = '12345';
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadCase(caseId);
		expect(http.get).toHaveBeenCalledWith(`${casesService.baseUrl}/${caseId}`);
	});

});
