import { inject, TestBed } from '@angular/core/testing';
import { RouterAppEffects } from './router.app.effects';
import { Observable } from 'rxjs/Observable';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { routerFeatureKey, RouterReducer } from '@ansyn/router/reducers/router.reducer';
import { casesFeatureKey, CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { RouterTestingModule } from '@angular/router/testing';

describe('RouterAppEffects', () => {
	let actions: Observable<any>;
	let routerAppEffects: RouterAppEffects;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[routerFeatureKey]: RouterReducer,
					[casesFeatureKey]: CasesReducer
				}),
				RouterTestingModule
			],
			providers: [
				RouterAppEffects,
				provideMockActions(() => actions)
			]
		});
	});

	beforeEach(inject([RouterAppEffects], (_routerAppEffects: RouterAppEffects) => {
		routerAppEffects = _routerAppEffects;
	}));

	it('should be defined', () => {
		expect(routerAppEffects).toBeDefined();
	});
});
