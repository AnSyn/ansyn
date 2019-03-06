import { inject, TestBed } from '@angular/core/testing';
import { FetchService } from './fetch.service';

describe('FetchService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [FetchService]
		});
	});

	it('should be created', inject([FetchService], (service: FetchService) => {
		expect(service).toBeTruthy();
	}));
});
