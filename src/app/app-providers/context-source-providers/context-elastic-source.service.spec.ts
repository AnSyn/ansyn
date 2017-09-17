import { inject, TestBed } from '@angular/core/testing';
import { ContextElasticSourceService, IElasticContextSource } from './context-elastic-source.service';
import { ContextModule } from '@ansyn/context/context.module';
import { ContextCriteria } from '@ansyn/context/context.interface';

const MOCK_ELASTIC_CONFIG: { elastic: IElasticContextSource } = {
	elastic: {
		uri: '',
		log: '',
		auth: ''
	}
};

describe('ContextElasticSourceService', () => {
	let contextSource: ContextElasticSourceService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				ContextModule.forRoot(MOCK_ELASTIC_CONFIG)
			],
			providers: [
				ContextElasticSourceService
			]
		});
	});

	beforeEach(inject([ContextElasticSourceService], (_contextSource: ContextElasticSourceService) => {
		contextSource = _contextSource;
	}));

	it('check that the module is initialized ', () => {
		expect(contextSource).toBeTruthy();
	});

	it('should make sure client is initialized', () => {
		expect(contextSource.client).not.toBeUndefined();
	});

	describe('ping', () => {
		it('should call client ping', () => {
			spyOn(contextSource.client, 'ping');
			contextSource.ping();
			expect(contextSource.client.ping).toHaveBeenCalled();
		});
	});

	describe('find', () => {
		it('should call client find', () => {
			spyOn(contextSource.client, 'search');
			contextSource.find(new ContextCriteria({ start: 0, limit: 10 }));
			expect(contextSource.client.search).toHaveBeenCalled();
		});
	});
});
