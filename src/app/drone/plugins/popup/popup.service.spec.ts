import { inject, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PopupService } from './popup.service';

describe('PopupService', () => {
	let me;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [PopupService]
		});
	});


	beforeEach(inject([PopupService], (service: PopupService) => {
		me = service;
	}));

	it('should be created', () => {
		expect(me).toBeDefined();
	});

});
