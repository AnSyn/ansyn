import { TestBed, inject } from '@angular/core/testing';

import { RouterStoreHelperService } from './router-store-helper.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Params, Router, UrlTree } from '@angular/router';

describe('RouterStoreHelperService', () => {
	let routerStoreHelperService: RouterStoreHelperService;
	let router: Router;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [RouterStoreHelperService]
		});
	});

	beforeEach(inject([RouterStoreHelperService, Router], (_routerStoreHelperService: RouterStoreHelperService, _router: Router) => {
		routerStoreHelperService = _routerStoreHelperService;
		router = _router;
	}));

	it('should be created', () => {
		expect(routerStoreHelperService ).toBeTruthy();
	});

	it('queryParamsViaPath be created', () => {
		const someUrlTree: UrlTree = <any> {queryParams: {a: 'b', c: 'd'}};
		spyOn(router, 'parseUrl').and.returnValue(someUrlTree);
		const result: Params = routerStoreHelperService.queryParamsViaPath('?a=b&c=d');
		expect(result).toEqual(someUrlTree.queryParams);
	});

	it('caseIdViaPath should return case_id from path', () => {
		const case_id = '1234-5678';
		const path = `/${case_id}`;
		expect(routerStoreHelperService.caseIdViaPath(path)).toEqual(case_id);
	});

});
