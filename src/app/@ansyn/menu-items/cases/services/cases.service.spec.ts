import { inject, TestBed } from '@angular/core/testing';
import { casesConfig, CasesService } from './cases.service';
import { UrlSerializer } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
				{
					provide: StorageService, useValue: {
						delete: () => of({}),
						create: () => of({}),
						update: () => of({}),
						get: () => of({})
					}
				},
				CasesService,
				UrlSerializer,
				MockCasesConfig,
				{ provide: ErrorHandlerService, useValue: { httpErrorHandle: () => throwError(null) } },
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
		spyOn(storageService, 'create').and.callFake(() => of(fakeResponse));
		spyOn(UUID, 'UUID').and.callFake(() => fakeId);
		casesService.createCase(selectedCase);
		expect(storageService.create).toHaveBeenCalledWith(casesService.config.schema,
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
		spyOn(storageService, 'update').and.callFake(() => of(fakeResponse));
		casesService.updateCase(selectedCase);
		expect(storageService.update).toHaveBeenCalledWith(casesService.config.schema,
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
		spyOn(storageService, 'delete').and.callFake(() => of(fakeResponse));
		casesService.removeCase('fakerId');
		expect(storageService.delete).toHaveBeenCalledWith(casesService.config.schema, caseIdToRemove);
	});

	it('loadCase should get single case from ajax("get")', () => {
		const caseId = '12345';
		spyOn(storageService, 'get').and.returnValue(of([]));
		casesService.loadCase(caseId);
		expect(storageService.get).toHaveBeenCalledWith(casesService.config.schema, caseId);
	});

});
