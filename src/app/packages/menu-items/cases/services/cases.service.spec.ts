import { inject, TestBed } from '@angular/core/testing';
import { CasesService } from './cases.service';
import { Case } from '../models/case.model';
import { casesConfig } from '@ansyn/menu-items/cases';
import { UrlSerializer } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandlerService } from '@ansyn/core';
import 'rxjs/add/observable/of';
import { UUID } from 'angular2-uuid';

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
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region', 'overlaysManualProcessArgs', 'orientation']

	}
} as any;

describe('CasesService', () => {
	let casesService: CasesService;
	let http: HttpClient;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CasesService, UrlSerializer, MockCasesConfig, {
				provide: ErrorHandlerService,
				useValue: { httpErrorHandle: () => Observable.throw(null) }
			}]
		});
	});

	beforeEach(inject([CasesService, HttpClient], (_casesService: CasesService, _http: HttpClient) => {
		casesService = _casesService;
		http = _http;
	}));


	it('should be defined', () => {
		expect(casesService).toBeDefined();
	});

	it('createCase should send the case as body in ajax("post")', () => {
		let fakeId = 'fakerId';
		let selectedCase: Case = { name: 'fakerName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'post').and.callFake(() => Observable.of(fakeResponse) );
		spyOn(UUID, 'UUID').and.callFake(() => fakeId);
		casesService.createCase(selectedCase);
		expect(http.post).toHaveBeenCalledWith(`${casesService.baseUrl}/cases/${fakeId}`, { ...selectedCase, id: fakeId});
	});

	it('updateCase should send the case as body in ajax("put")', () => {
		let selectedCase: Case = { id: 'fakerId', name: 'fakerOtherName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'put').and.callFake(() => Observable.of(fakeResponse) );
		casesService.updateCase(selectedCase);
		expect(http.put).toHaveBeenCalledWith(`${casesService.baseUrl}/cases/fakerId`, selectedCase);
	});

	it('updateCase should send the case id as param in ajax("delete")', () => {
		let selectedCase: Case = { id: 'fakerId', name: 'fakerOtherName' };
		let caseIdToRemove = selectedCase.id;
		let fakeResponse = { selectedCase };
		spyOn(http, 'delete').and.callFake(() => Observable.of(fakeResponse));
		casesService.removeCase('fakerId');
		expect(http.delete).toHaveBeenCalledWith(`${casesService.baseUrl}/cases/${caseIdToRemove}`);
	});

	it('loadContexts should send the all contexts from ajax("get")', () => {
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadContexts();
		expect(http.get).toHaveBeenCalledWith(`${casesService.baseUrl}/contexts?from=0&limit=100`);
	});

	it('loadCase should get single case from ajax("get")', () => {
		const caseId = '12345';
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadCase(caseId);
		expect(http.get).toHaveBeenCalledWith(`${casesService.baseUrl}/cases/${caseId}`);
	});

});
