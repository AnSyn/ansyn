import { TestBed } from '@angular/core/testing';

import { OverlayStatusService } from './overlay-status.service';
import { overlayStatusConfig } from '../config/overlay-status-config';

describe('OverlayStatusService', () => {
	let service: OverlayStatusService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: overlayStatusConfig,
					useValue: { ImageProcParams: [] }
				}
			]
		});
		service = TestBed.inject(OverlayStatusService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
