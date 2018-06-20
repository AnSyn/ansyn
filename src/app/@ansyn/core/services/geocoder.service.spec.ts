import { inject, TestBed } from '@angular/core/testing';

import { GeocoderService } from './geocoder.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { ICoreConfig } from '@ansyn/core/models/core.config.model';
import { CoreConfig } from '@ansyn/core/models/core.config';

describe('GeocoderService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [GeocoderService,
				{ provide: ErrorHandlerService, useValue: {}},
				{ provide: CoreConfig, useValue: <ICoreConfig> {}}
			]
		});
	});

	it('should be created', inject([GeocoderService], (service: GeocoderService) => {
		expect(service).toBeTruthy();
	}));
});
