import { inject, TestBed } from '@angular/core/testing';
import { ContextModule } from '../context.module';
import { ContextConfig } from '@ansyn/context/models';
import { ContextService } from '@ansyn/context/services/context.service';
import { StoreModule } from '@ngrx/store';
import { CoreConfig, ErrorHandlerService, StorageService } from '@ansyn/core';
import { HttpClientModule } from '@angular/common/http';

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
