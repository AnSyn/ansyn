import { inject, TestBed } from '@angular/core/testing';
import { ContextService } from './context.service';
import { HttpClientModule } from '@angular/common/http';
import { CoreConfig } from '../../models/core.config';
import { StorageService } from '../../services/storage/storage.service';
import { ContextConfig } from '../models/context.config';
import { ErrorHandlerService } from '../../services/error-handler.service';

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
