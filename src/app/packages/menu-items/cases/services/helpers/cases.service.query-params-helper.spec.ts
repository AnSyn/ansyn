import { inject, TestBed } from '@angular/core/testing';
import { UrlSerializer } from '@angular/router';
import { QueryParamsHelper } from './cases.service.query-params-helper';
import { Case } from '../../models/case.model';
import { CasesService } from '../cases.service';
import * as rison from 'rison';
import * as wellknown from 'wellknown';
import { MockCasesConfig } from '../cases.service.spec';
import { HttpClientModule } from '@angular/common/http';

describe('CasesService', () => {
	let casesService: CasesService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [CasesService, UrlSerializer, MockCasesConfig]
		});
	});

	beforeEach(inject([CasesService], (_casesService: CasesService) => {
		casesService = _casesService;
	}));
	let queryParamsHelper: QueryParamsHelper;

	describe('QueryParamsHelper', () => {
		beforeEach(() => {
			queryParamsHelper = (<any>casesService).queryParamsHelper;
		});

		it('updateCaseViaQueryParmas should get q_params values and set them on case state (after parsing them)', () => {
			spyOn(queryParamsHelper, 'decodeCaseObjects').and.callFake((key, val) => val);
			const fake_q_params = {
				'a': 'b',
				'c': 'd'
			};

			let fake_case: Case = {
				id: '12345678',
				state: {}
			} as any;

			fake_case = queryParamsHelper.updateCaseViaQueryParmas(fake_q_params, fake_case);
			expect(queryParamsHelper.decodeCaseObjects).toHaveBeenCalledTimes(2);
			expect(fake_case.state['a']).toEqual(fake_q_params['a']);
			expect(fake_case.state['c']).toEqual(fake_q_params['c']);
		});

		it('generateQueryParamsViaCase should parse url to q_params object (after parsing) ', () => {
			spyOn(queryParamsHelper, 'encodeCaseObjects').and.callFake((key, val) => val);
			spyOn((<any>queryParamsHelper).casesService.urlSerializer, 'parse').and.returnValue({ queryParams: {} });

			let fake_case: Case = {
				id: '12345678',
				state: {
					facets: 'facets', time: 'time', maps: 'maps', region: 'region'
				}
			} as any;

			const fake_q_params = queryParamsHelper.generateQueryParamsViaCase(fake_case);
			expect(queryParamsHelper.encodeCaseObjects).toHaveBeenCalledTimes(4);

		});

		it('encodeCaseObjects should switch between keys, "region" should encode by "wellknown" and other keys by "rison"', () => {
			spyOn(rison, 'encode');
			spyOn(wellknown, 'stringify');

			queryParamsHelper.encodeCaseObjects('facets', 'facets_value');
			expect(rison.encode).toHaveBeenCalledWith('facets_value');

			queryParamsHelper.encodeCaseObjects('time', { from: 'from', to: 'to' });
			expect(rison.encode).toHaveBeenCalledWith({ from: 'from', to: 'to' });

			queryParamsHelper.encodeCaseObjects('maps', { data: [] });
			expect(rison.encode).toHaveBeenCalledWith({ data: [] });

			queryParamsHelper.encodeCaseObjects('region', 'region_value');
			expect(wellknown.stringify).toHaveBeenCalledWith('region_value');
		});

		it('decodeCaseObjects should switch between keys, "region" should decode by "wellknown" and other keys by "rison"', () => {
			spyOn(rison, 'decode');
			spyOn(wellknown, 'parse');

			queryParamsHelper.decodeCaseObjects('facets', 'facets_value');
			expect(rison.decode).toHaveBeenCalledWith('facets_value');

			queryParamsHelper.decodeCaseObjects('time', { from: 'from', to: 'to' });
			expect(rison.decode).toHaveBeenCalledWith({ from: 'from', to: 'to' });

			queryParamsHelper.decodeCaseObjects('maps', 'maps_value');
			expect(rison.decode).toHaveBeenCalledWith('maps_value');

			queryParamsHelper.decodeCaseObjects('region', 'region_value');
			expect(wellknown.parse).toHaveBeenCalledWith('region_value');
		});
	});


});
