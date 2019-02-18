import { inject, TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { ErrorHandlerService, StorageService } from '@ansyn/core';
import { OverlaysService } from '@ansyn/overlays';

describe('TasksService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TasksService,
				{ provide: 'algorithmsConfig', useValue: {}},
				{ provide: StorageService, useValue: {}},
				{ provide: OverlaysService, useValue: {}},
				{ provide: ErrorHandlerService, useValue: {}}
			]
		});
	});

	it('should be created', inject([TasksService], (service: TasksService) => {
		expect(service).toBeTruthy();
	}));
});
