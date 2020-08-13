import { inject, TestBed } from '@angular/core/testing';
import { UrlSerializer } from '@angular/router';
import { QueryParamsHelper } from './cases.service.query-params-helper';
import { CasesService } from '../cases.service';
import * as rison from 'rison';
import * as wellknown from 'wellknown';
import { MockCasesConfig } from '../cases.service.spec';
import { HttpClientModule } from '@angular/common/http';
import { throwError } from 'rxjs';
import { CoreConfig } from '../../../../core/models/core.config';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { StorageService } from '../../../../core/services/storage/storage.service';
import {
	ICase,
	ICaseFacetsState,
	ICompressedCaseFacetsState,
	ICompressedCaseMapsState,
	IDilutedCaseMapsState
} from '../../models/case.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('CasesService', () => {
	let casesService: CasesService;
	let urlSerializer: UrlSerializer;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule, TranslateModule],
			providers: [
				{ provide: StorageService, useValue: {} },
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
					provide: TranslateService,
					useValue: {}
				},
				{
					provide: ErrorHandlerService,
					useValue: { httpErrorHandle: () => throwError(null) }
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

			let fakeCase: ICase = {
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
			spyOn(urlSerializer, 'parse').and.returnValue(<any>{ queryParams: {} });

			let fakeCase: ICase = {
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

			const facetsValue: ICaseFacetsState = {
				showOnlyFavorites: false,
				filters: []
			};

			const compressedFacetsValue: ICompressedCaseFacetsState = {
				fav: false,
				f: []
			};

			queryParamsHelper.encodeCaseObjects('facets', facetsValue);
			expect(rison.encode).toHaveBeenCalledWith(compressedFacetsValue);
			const date = new Date();
			queryParamsHelper.encodeCaseObjects('time', { from: date, to: date });
			expect(rison.encode).toHaveBeenCalledWith({ from: date.getTime(), to: date.getTime() });

			const mapData: IDilutedCaseMapsState = {
				activeMapId: '',
				data: [],
				layout: 'layout1'
			};

			const compressedMapData: ICompressedCaseMapsState = {
				id: '',
				d: [],
				l: 'layout1'
			};

			queryParamsHelper.encodeCaseObjects('maps', mapData);
			expect(rison.encode).toHaveBeenCalledWith(compressedMapData);

			queryParamsHelper.encodeCaseObjects('region', 'regionValue');
			expect(wellknown.stringify).toHaveBeenCalledWith('regionValue');
		});

		it('decodeCaseObjects should switch between keys, "region" should decode by "wellknown" and other keys by "rison"', () => {
			spyOn(rison, 'decode');
			spyOn(wellknown, 'parse');

			queryParamsHelper.decodeCaseObjects('facets', queryParamsHelper.rot13(rison.encode('facetsValue')));
			expect(rison.decode).toHaveBeenCalledWith(rison.encode('facetsValue'));

			queryParamsHelper.decodeCaseObjects('time', queryParamsHelper.rot13(rison.encode( { from: 'from', to: 'to' })));
			expect(rison.decode).toHaveBeenCalledWith(rison.encode( { from: 'from', to: 'to' }));

			queryParamsHelper.decodeCaseObjects('maps',  queryParamsHelper.rot13('mapsValue'));
			expect(rison.decode).toHaveBeenCalledWith('mapsValue');

			queryParamsHelper.decodeCaseObjects('region', queryParamsHelper.rot13('regionValue'));
			expect(wellknown.parse).toHaveBeenCalledWith('regionValue');
		});
	});


})
;

