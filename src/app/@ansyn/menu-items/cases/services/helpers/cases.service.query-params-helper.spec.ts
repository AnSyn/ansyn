import { inject, TestBed } from '@angular/core/testing';
import { UrlSerializer } from '@angular/router';
import { QueryParamsHelper } from './cases.service.query-params-helper';
import { Case } from '../../models/case.model';
import { CasesService } from '../cases.service';
import * as rison from 'rison';
import * as wellknown from 'wellknown';
import { MockCasesConfig } from '../cases.service.spec';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

describe('CasesService', () => {
	let casesService: CasesService;
	let urlSerializer: UrlSerializer;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [
				StorageService,
				{ provide: CoreConfig, useValue: {} },
				CasesService,
				{
					provide: UrlSerializer,
					useValue: {
						parse: () => {
						}
					}
				},
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => Observable.throw(null) }
				},
				MockCasesConfig
			]
		})
		;
	});

	beforeEach(inject([CasesService, UrlSerializer], (_casesService: CasesService, _urlSerializer: UrlSerializer) => {
		casesService = _casesService;
		urlSerializer = _urlSerializer;
	}));
	let queryParamsHelper: QueryParamsHelper;

	describe('QueryParamsHelper', () => {
		beforeEach(() => {
			queryParamsHelper = (<any>casesService).queryParamsHelper;
		});

		it('updateCaseViaQueryParmas should get qParams values and set them on case state (after parsing them)', () => {
			spyOn(queryParamsHelper, 'decodeCaseObjects').and.callFake((key, val) => val);
			const fakeQParams = {
				'a': 'b',
				'c': 'd'
			};

			let fakeCase: Case = {
				id: '12345678',
				state: {}
			} as any;

			fakeCase = queryParamsHelper.updateCaseViaQueryParmas(fakeQParams, fakeCase);
			expect(queryParamsHelper.decodeCaseObjects).toHaveBeenCalledTimes(2);
			expect(fakeCase.state['a']).toEqual(fakeQParams['a']);
			expect(fakeCase.state['c']).toEqual(fakeQParams['c']);
		});

		it('generateQueryParamsViaCase should parse url to qParams object (after parsing) ', () => {
			spyOn(queryParamsHelper, 'encodeCaseObjects').and.callFake((key, val) => val);
			spyOn(urlSerializer, 'parse').and.returnValue({ queryParams: {} });

			let fakeCase: Case = {
				id: '12345678',
				state: {
					facets: 'facets', time: 'time', maps: 'maps', region: 'region'
				}
			} as any;

			const fakeQParams = queryParamsHelper.generateQueryParamsViaCase(fakeCase);
			expect(queryParamsHelper.encodeCaseObjects).toHaveBeenCalledTimes(4);

		});

		it('encodeCaseObjects should switch between keys, "region" should encode by "wellknown" and other keys by "rison"', () => {
			spyOn(rison, 'encode');
			spyOn(wellknown, 'stringify');

			queryParamsHelper.encodeCaseObjects('facets', 'facetsValue');
			expect(rison.encode).toHaveBeenCalledWith('facetsValue');
			const date = new Date();
			queryParamsHelper.encodeCaseObjects('time', { from: date, to: date });
			expect(rison.encode).toHaveBeenCalledWith({ from: date.toISOString(), to: date.toISOString() });

			queryParamsHelper.encodeCaseObjects('maps', { data: [] });
			expect(rison.encode).toHaveBeenCalledWith({ data: [] });

			queryParamsHelper.encodeCaseObjects('region', 'regionValue');
			expect(wellknown.stringify).toHaveBeenCalledWith('regionValue');
		});

		it('decodeCaseObjects should switch between keys, "region" should decode by "wellknown" and other keys by "rison"', () => {
			spyOn(rison, 'decode');
			spyOn(wellknown, 'parse');

			queryParamsHelper.decodeCaseObjects('facets', 'facetsValue');
			expect(rison.decode).toHaveBeenCalledWith('facetsValue');

			queryParamsHelper.decodeCaseObjects('time', { from: 'from', to: 'to' });
			expect(rison.decode).toHaveBeenCalledWith({ from: 'from', to: 'to' });

			queryParamsHelper.decodeCaseObjects('maps', 'mapsValue');
			expect(rison.decode).toHaveBeenCalledWith('mapsValue');

			queryParamsHelper.decodeCaseObjects('region', 'regionValue');
			expect(wellknown.parse).toHaveBeenCalledWith('regionValue');
		});
	});


})
;
