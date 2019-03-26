import { inject, TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';
import { ErrorHandlerService, StorageService } from '../../../core/public_api';
import { OverlaysService } from '../../../overlays/services/overlays.service';

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
