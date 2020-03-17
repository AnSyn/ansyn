import { TestBed } from '@angular/core/testing';

import { TimePickerTranslateService } from './time-picker-translate.service';
import { TranslateService } from '@ngx-translate/core';

describe('TimePickerTranslateService', () => {
	const mockTranslateService = {
		instant: () => {}
	};

	beforeEach(() => TestBed.configureTestingModule({
		providers: [
			{ provide: TranslateService, useValue: mockTranslateService }
		]
	}));

	it('should be created', () => {
		const service: TimePickerTranslateService = TestBed.get(TimePickerTranslateService);
		expect(service).toBeTruthy();
	});
});
