import { inject, TestBed } from '@angular/core/testing';

import { ProjectionConverterService } from './projection-converter.service.ts';

describe('ProjectionConverterService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ProjectionConverterService]
		});
	});

	it('should be created', inject([ProjectionConverterService], (service: ProjectionConverterService) => {
		expect(service).toBeTruthy();
	}));
});
