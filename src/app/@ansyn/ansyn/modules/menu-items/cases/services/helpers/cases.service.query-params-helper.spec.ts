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


})
;

