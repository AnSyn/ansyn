import { inject, TestBed } from '@angular/core/testing';
import { AnaglyphSensorService } from './anaglyph-sensor.service';
import { GetProvidersMapsService, ImageryCommunicatorService } from '@ansyn/imagery';
import { AnaglyphConfig } from '../models/anaglyph.model';
import { of } from 'rxjs';

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
					useValue: {
						provide: () => {
						}
					}
				},
				{
					provide: AnaglyphConfig,
					useValue: {}
				},
				{
					provide: GetProvidersMapsService,
					useValue: {
						getMapSourceProvider: () => of()
					}
				}
			]
		});
	});

	it('should be created', inject([AnaglyphSensorService], (service: AnaglyphSensorService) => {
		expect(service).toBeTruthy();
	}));
});
