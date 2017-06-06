/**
 * Created by AsafMas on 08/05/2017.
 */

import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService } from './communicator.service';

describe('CommunicatorEntity', () => {
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({declarations: [], providers: [ ImageryCommunicatorService]}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create "imageryCommunicatorService" service', () => {
		expect(imageryCommunicatorService).toBeTruthy();
	});
});
