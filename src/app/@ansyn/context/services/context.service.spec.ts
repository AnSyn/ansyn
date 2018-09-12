import { inject, TestBed } from '@angular/core/testing';
import { ContextService } from './context.service';
import { HttpClientModule } from '@angular/common/http';
import { CoreConfig } from '@ansyn/core';
import { StorageService } from '@ansyn/core';
import { ContextConfig } from '../models/context.config';
import { ErrorHandlerService } from '@ansyn/core';

describe('ContextService', () => {
	let contextService: ContextService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule
			],
			providers: [
				{ provide: CoreConfig, useValue: {} },
				StorageService,
				{
					provide: ContextConfig,
					useValue: {}
				},
				ContextService,
				{
					provide: ErrorHandlerService,
					useValue: {
						httpErrorHandle: () => {}
					}
				}
			]
		});
	});

	beforeEach(inject([ContextService], (_contextService: ContextService) => {
		contextService = _contextService;
	}));

	it('should be defined', () => {
		expect(contextService).toBeDefined();
	});
});
