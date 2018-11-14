import { inject, TestBed } from '@angular/core/testing';

import { TasksService } from './tasks.service';

describe('TasksService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TasksService,
				{
					provide: 'algorithmsConfig',
					useValue: {}
				}
			]
		});
	});

	it('should be created', inject([TasksService], (service: TasksService) => {
		expect(service).toBeTruthy();
	}));
});
