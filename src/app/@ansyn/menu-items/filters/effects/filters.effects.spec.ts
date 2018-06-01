import { Observable } from 'rxjs/Observable';
import { async, inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { filtersFeatureKey, FiltersReducer } from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { coreFeatureKey, CoreReducer } from '@ansyn/core/reducers/core.reducer';
import { FiltersEffects } from '@ansyn/menu-items/filters/effects/filters.effects';

describe('FiltersEffects', () => {
	let filtersEffects: FiltersEffects;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[coreFeatureKey]: CoreReducer,
					[filtersFeatureKey]: FiltersReducer
				})
			],
			providers: [
				FiltersEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([FiltersEffects], (_filtersEffects: FiltersEffects) => {
		filtersEffects = _filtersEffects;
	}));

});
