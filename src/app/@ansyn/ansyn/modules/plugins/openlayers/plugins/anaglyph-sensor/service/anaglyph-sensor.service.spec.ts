import { inject, TestBed } from '@angular/core/testing';
import { AnaglyphSensorService } from './anaglyph-sensor.service';
import { ImageryCommunicatorService } from '@ansyn/imagery';

describe('AnaglyphSensorService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: AnaglyphSensorService,
					useClass: AnaglyphSensorService,
					deps: [ImageryCommunicatorService]
				},
				{
					provide: ImageryCommunicatorService,
					useValue: { provide: () => {} }
				}
			]
		});
	});

	it('should be created', inject([AnaglyphSensorService], (service: AnaglyphSensorService) => {
		expect(service).toBeTruthy();
	}));
});
