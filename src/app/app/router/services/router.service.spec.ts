import { inject, TestBed } from '@angular/core/testing';

import { AnsynRouterService } from './router.service';
import { RouterTestingModule } from '@angular/router/testing';
import { routerFeatureKey, RouterReducer } from '../reducers/router.reducer';
import { StoreModule } from '@ngrx/store';

describe('RouterFacadeService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, StoreModule.forRoot({ [routerFeatureKey]: RouterReducer })],
			providers: [AnsynRouterService]
		});
	});

	it('should be created', inject([AnsynRouterService], (service: AnsynRouterService) => {
		expect(service).toBeTruthy();
	}));
});
