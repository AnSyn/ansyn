import { TestBed, inject } from '@angular/core/testing';

import { AttributesService } from './attributes.service';
import { OL_PLUGINS_CONFIG } from '../../../plugins.config';

describe('AttributesService', () => {
	let service: AttributesService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: OL_PLUGINS_CONFIG,
					useValue: { Annotations: { displayId: true } }
				}
			]
		});
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
