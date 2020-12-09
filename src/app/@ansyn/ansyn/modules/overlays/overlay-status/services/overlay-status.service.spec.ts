import { TestBed } from '@angular/core/testing';

import { OverlayStatusService } from './overlay-status.service';

describe('OverlayStatusService', () => {
	let service: OverlayStatusService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(OverlayStatusService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
