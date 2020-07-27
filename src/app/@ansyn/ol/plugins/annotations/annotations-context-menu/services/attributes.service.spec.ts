import { TestBed, inject } from '@angular/core/testing';

import { AttributesService } from './attributes.service';

describe('AttributesService', () => {
	let service: AttributesService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		// service = TestBed.inject(AttributesService);
	});

	beforeEach(inject(
		[AttributesService],
		(_attributeService: AttributesService) => {
			service = _attributeService;
		}
	));

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
