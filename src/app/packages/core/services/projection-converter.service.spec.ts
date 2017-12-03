import { inject, TestBed } from '@angular/core/testing';

import { ProjectionConverterService } from './projection-converter.service';
import { toolsConfig } from '../../menu-items/tools/models';

describe('ProjectionConverterService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ProjectionConverterService, { provide: toolsConfig, useValue: { Proj4: 'fakeWhatever' } }]
		});
	});

	it('should be created', inject([ProjectionConverterService], (service: ProjectionConverterService) => {
		expect(service).toBeTruthy();
	}));
});
