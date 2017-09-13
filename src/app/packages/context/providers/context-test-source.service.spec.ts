import { TestBed, inject } from '@angular/core/testing';
import { ContextTestSourceService, ITestContextConfig } from './context-test-source.service';
import { ContextModule } from '../context.module';

export const MOCK_TEST_CONFIG: { test: ITestContextConfig } = {
	test: {
		uri: ''
	}
};

describe('ContextTestSource', () => {
	let contextSource: ContextTestSourceService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				ContextModule.forRoot(MOCK_TEST_CONFIG)
			],
			providers: [
				ContextTestSourceService
			]
		});
	});

	beforeEach(inject([ContextTestSourceService], (_contextSource: ContextTestSourceService) => {
		contextSource = _contextSource;
	}));

	it('check that the module is initialized ', () => {
		expect(contextSource).toBeTruthy();
	});
});
