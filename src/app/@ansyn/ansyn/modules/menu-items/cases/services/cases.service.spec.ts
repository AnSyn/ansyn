import { inject, TestBed } from '@angular/core/testing';
import { casesConfig, CasesService } from './cases.service';
import { UrlSerializer } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CoreConfig } from '../../../core/models/core.config';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { StorageService } from '../../../core/services/storage/storage.service';
import { ICase } from '../models/case.model';

const caseMock: ICase = {
	id: 'fakeId',
	name: 'fakeName',
	creationTime: new Date(),
	shared: false,
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
export const MockCasesConfig = {
	provide: casesConfig,
	useValue: {
		defaultCase: caseMock,
		schema: 'cases'

	}
} as any;

describe('CasesService', () => {
	let casesService: CasesService;
	let http: HttpClient;
	let storageService: StorageService;

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
		let fakeResponse = { caseMock };
		let newDate = new Date();
		spyOn(storageService, 'create').and.callFake(() => <any>of(fakeResponse));
		casesService.createCase(caseMock, newDate);
		expect(storageService.create).toHaveBeenCalledWith(casesService.config.schema,
			{
				preview: {
					id: caseMock.id,
					name: caseMock.name,
					creationTime: newDate,
					autoSave: false
				},
				data: casesService.pluckIdSourceType(caseMock.state),
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
		spyOn(storageService, 'get').and.returnValue(<any>of([]));
		casesService.loadCase(caseId);
		expect(storageService.get).toHaveBeenCalledWith(casesService.config.schema, caseId);
	});

});
