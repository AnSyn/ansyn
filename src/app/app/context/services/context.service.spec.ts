import { inject, TestBed } from '@angular/core/testing';
import { ContextService } from './context.service';
import { HttpClientModule } from '@angular/common/http';
import { CoreConfig, ErrorHandlerService, StorageService } from '@ansyn/core';
import { ContextConfig } from '../models/context.config';

describe('ContextService', () => {
	let contextService: ContextService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule
			],
			providers: [
				{ provide: CoreConfig, useValue: {} },
				{ provide: StorageService, useValue: {} },
				{
					provide: ContextConfig,
					useValue: {}
				},
				ContextService,
				{
					provide: ErrorHandlerService,
					useValue: {
						httpErrorHandle: () => {
						}
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
