import { inject, TestBed } from '@angular/core/testing';
import { ContextService } from 'src/app/@ansyn/core/context/services/context.service';
import { HttpClientModule } from '@angular/common/http';
import { CoreConfig } from '@ansyn/core/models/core.config';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ContextConfig } from 'src/app/@ansyn/core/context/models/context.config';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

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
