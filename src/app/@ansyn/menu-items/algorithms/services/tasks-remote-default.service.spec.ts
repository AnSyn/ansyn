import { inject, TestBed } from '@angular/core/testing';

import { TasksRemoteDefaultService } from './tasks-remote-default.service';

describe('TasksRemoteDefaultService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [TasksRemoteDefaultService]
		});
	});

	it('should be created', inject([TasksRemoteDefaultService], (service: TasksRemoteDefaultService) => {
		expect(service).toBeTruthy();
	}));
});
