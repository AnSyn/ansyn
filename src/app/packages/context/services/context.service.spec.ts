import { inject, TestBed } from '@angular/core/testing';
import { ContextModule } from '../context.module';
import { ContextConfig } from '@ansyn/context/models';
import { ContextService } from '@ansyn/context/services/context.service';

describe('ContextTestSource', () => {
	let contextService: ContextService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				ContextModule
			],
			providers: [
				{
					provide: ContextConfig
					useValue: {}
				},
				ContextService
			]
		});
	});

	beforeEach(inject([ContextService], (_contextService: ContextService) => {
		contextService = _contextService;
	}));

	it('check that the module is initialized ', () => {
		expect(contextService).toBeTruthy();
	});
});
