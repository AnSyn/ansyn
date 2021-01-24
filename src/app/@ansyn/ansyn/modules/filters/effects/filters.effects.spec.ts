import { Observable } from 'rxjs';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { FiltersEffects } from './filters.effects';
import { filtersFeatureKey, FiltersReducer } from '../reducer/filters.reducer';
import { TranslateModule } from '@ngx-translate/core';

describe('FiltersEffects', () => {
	let filtersEffects: FiltersEffects;
	let actions: Observable<any>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				TranslateModule,
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
