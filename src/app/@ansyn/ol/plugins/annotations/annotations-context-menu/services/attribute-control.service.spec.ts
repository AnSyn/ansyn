import { TestBed, inject } from '@angular/core/testing';

import { AttributeControlService } from './attribute-control.service';

describe('AttributeControlService', () => {
	let service: AttributeControlService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});
	beforeEach(inject(
		[AttributeControlService],
		(_attributeService: AttributeControlService) => {
			service = _attributeService;
		}
	));

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
