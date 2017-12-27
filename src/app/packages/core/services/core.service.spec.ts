import { inject, TestBed } from '@angular/core/testing';
import { CoreService } from './core.service';
import { CaseMapState } from '../models/case.model';

describe('CoreService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CoreService]
		});
	});

	it('should be created', inject([CoreService], (service: CoreService) => {
		expect(service).toBeTruthy();
	}));


	it('getOveralysMarkup ', () => {
		const activeMapId = '333';
		const mapsList = <CaseMapState[]> [
			{ id: '333', data: { overlay: { id: '333-a' } } },
			{ id: '444', data: { overlay: { id: '444-a' } } },
			{ id: '5555', data: {} }
		];
		const favoriteOverlays = [];
		const result = CoreService.getOverlaysMarkup(mapsList, activeMapId, favoriteOverlays);
		expect(result.length).toBe(2);
		expect(result[0].class).toBe('active');
		expect(result[1].class).toBe('displayed');
	});
});
