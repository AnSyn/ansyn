import { TestBed } from '@angular/core/testing';

import { ComponentVisibilityService } from './component-visibility.service';
import { COMPONENT_MODE, COMPONENT_VISIBILITY } from './component-mode';

describe('ComponentModeService', () => {
	let service: ComponentVisibilityService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provider: COMPONENT_MODE,
					useValue: true
				},
				{
					provide: COMPONENT_VISIBILITY,
					useValue: {
						component: false
					}
				}
			]
		});
		service = TestBed.inject(ComponentVisibilityService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});


	it('get should return the value from the config only if we in component_mode', () => {
		expect(service.get('component')).toBeFalsy();
	});
});

describe('ComponentModeService', () => {
	let service: ComponentVisibilityService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provider: COMPONENT_MODE,
					useValue: false
				},
				{
					provide: COMPONENT_VISIBILITY,
					useValue: {
						component: false
					}
				}
			]
		});
		service = TestBed.inject(ComponentVisibilityService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('get should return true if we not in component_mode no matter what the visibility state', () => {
		expect(service.get('component')).toBeTruthy();
	})
});
