import { inject, TestBed } from '@angular/core/testing';
import { casesConfig, CasesService } from './cases.service';
import { UrlSerializer } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import 'rxjs/add/observable/of';
import { UUID } from 'angular2-uuid';
import { CoreConfig, ErrorHandlerService, ICase, StorageService } from '@ansyn/core';

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
		schema: 'cases',
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region', 'overlaysManualProcessArgs', 'orientation']

	}
} as any;

describe('CasesService', () => {
	let casesService: CasesService;
	let http: HttpClient;
	let storageService: StorageService;

	const caseMock: ICase = {
		id: 'fakeId',
		name: 'fakeName',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		autoSave: true,
		state: {
			time: {
				type: 'absolute',
				from: new Date(),
				to: new Date()
			},
			orientation: 'Align North',
			dataInputFilters: { filters: [], active: true },
			timeFilter: 'Start - End',
			region: {},
			maps: {
				layout: 'layout1',
				activeMapId: 'activeMapId',
				data: [
					{
						id: 'activeMapId',
						data: {
							overlay: {
								id: 'overlayId1',
								sourceType: 'PLANET',
								position: {
									zoom: 1, center: 2, boundingBox: { test: 1 }
								},
								isHistogramActive: false
							}
						}
					}
				]
			},
			overlaysManualProcessArgs: {}
		} as any
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				StorageService,
				CasesService,
				UrlSerializer,
				MockCasesConfig,
				{ provide: ErrorHandlerService, useValue: { httpErrorHandle: () => Observable.throw(null) } },
				{ provide: CoreConfig, useValue: { storageService: { baseUrl: 'fake-base-url' } } }
			]
		});
	});

	beforeEach(inject([StorageService, CasesService, HttpClient],
		(_storageService: StorageService, _casesService: CasesService, _http: HttpClient) => {
			storageService = _storageService;
			casesService = _casesService;
			http = _http;
		}));


	it('should be defined', () => {
		expect(casesService).toBeDefined();
	});

	it('createCase should send the case as body in ajax("post")', () => {
		let fakeId = 'fakerId';
		let selectedCase: ICase = { ...caseMock, name: 'fakerName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'post').and.callFake(() => Observable.of(fakeResponse));
		spyOn(UUID, 'UUID').and.callFake(() => fakeId);
		casesService.createCase(selectedCase);
		expect(http.post).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${casesService.config.schema}/${fakeId}`,
			{
				preview: {
					id: fakeId,
					name: selectedCase.name,
					owner: selectedCase.owner,
					creationTime: selectedCase.creationTime,
					lastModified: selectedCase.lastModified,
					autoSave: true
				},
				data: casesService.pluckIdSourceType(selectedCase.state)
			});
	});

	it('updateCase should send the case as body in ajax("put")', () => {
		let selectedCase: ICase = { ...caseMock, id: 'fakerId', name: 'fakerOtherName' };
		let fakeResponse = { selectedCase };
		spyOn(http, 'put').and.callFake(() => Observable.of(fakeResponse));
		casesService.updateCase(selectedCase);
		expect(http.put).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${casesService.config.schema}/fakerId`,
			{
				preview: {
					id: selectedCase.id,
					name: selectedCase.name,
					owner: selectedCase.owner,
					creationTime: selectedCase.creationTime,
					lastModified: selectedCase.lastModified,
					autoSave: true
				},
				data: casesService.pluckIdSourceType(selectedCase.state)
			});
	});

	it('deleteCase should send the case id as param in ajax("delete")', () => {
		let selectedCase: ICase = { ...caseMock, id: 'fakerId', name: 'fakerOtherName' };
		let caseIdToRemove = selectedCase.id;
		let fakeResponse = { selectedCase };
		spyOn(http, 'delete').and.callFake(() => Observable.of(fakeResponse));
		casesService.removeCase('fakerId');
		expect(http.delete).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${casesService.config.schema}/${caseIdToRemove}`);
	});

	it('loadCase should get single case from ajax("get")', () => {
		const caseId = '12345';
		spyOn(http, 'get').and.returnValue(Observable.of([]));
		casesService.loadCase(caseId);
		expect(http.get).toHaveBeenCalledWith(`${storageService.config.storageService.baseUrl}/${casesService.config.schema}/${caseId}`);
	});

});
