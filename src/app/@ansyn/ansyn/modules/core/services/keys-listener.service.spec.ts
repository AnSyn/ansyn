import { TestBed } from '@angular/core/testing';

import { KeysListenerService } from './keys-listener.service';

describe('KeysListenerService', () => {
	let service: KeysListenerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(KeysListenerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
