import { inject, TestBed } from '@angular/core/testing';

import { CoreService } from './core.service';

describe('CoreService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [CoreService]
		});
	});

	it('should be created', inject([CoreService], (service: CoreService) => {
		expect(service).toBeTruthy();
	}));

	/*
	it('function getOveralysMarkup ', () => {
		const testCase = {
			state: {
				maps: {
					activeMapId: '333',
					data: [
						{
							id: '333',
							data: {
								overlay: {
									id: '333-a'
								}
							}
						},
						{
							id: '444',
							data: {
								overlay: {
									id: '444-a'
								}
							}
						},
						{
							id: '5555',
							data: {}
						}
					]
				}
			}
		} as any;
		const result = CasesService.getOverlaysMarkup(testCase);
		expect(result.length).toBe(2);
		expect(result[0].class).toBe('active');
		expect(result[1].class).toBe('displayed');
	});

	 */
});
