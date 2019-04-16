import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { FiltersEffects } from './filters.effects';
import { filtersFeatureKey, FiltersReducer } from '../reducer/filters.reducer';

describe('FiltersEffects', () => {
	let filtersEffects: FiltersEffects;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
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
