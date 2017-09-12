import { TestBed, inject } from '@angular/core/testing';

import { AnsynRouterService } from './router.service';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterReducer } from '../reducers/router.reducer';
import { StoreModule } from '@ngrx/store';

describe('RouterFacadeService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule, StoreModule.provideStore({ router: RouterReducer }),],
			providers: [AnsynRouterService]
		});
	});

	it('should be created', inject([AnsynRouterService], (service: AnsynRouterService) => {
		expect(service).toBeTruthy();
	}));
});
