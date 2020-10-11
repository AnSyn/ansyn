import { TestBed } from '@angular/core/testing';

import { ImageryZoomerService } from './imagery-zoomer.service';
import { ImageryCommunicatorService } from '@ansyn/imagery';

describe('ImageryZoomerService', () => {
	beforeEach(() => TestBed.configureTestingModule({
		providers: [ImageryCommunicatorService]
	}));

	it('should be created', () => {
		const service: ImageryZoomerService = TestBed.inject(ImageryZoomerService);
		expect(service).toBeTruthy();
	});
});
