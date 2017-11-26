import { FiltersAppEffects } from './filters.app.effects';
import { Observable } from 'rxjs/Observable';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	filtersFeatureKey,
	FiltersReducer,
	filtersStateSelector
} from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { InitializeFiltersAction, SetFiltersAction, UpdateCaseAction } from '../../../index';
import {
	InitializeFiltersSuccessAction,
	ResetFiltersAction
} from '@ansyn/menu-items/filters/actions/filters.actions';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import {
	OverlayReducer,
	overlaysFeatureKey,
	overlaysStateSelector
} from '@ansyn/overlays/reducers/overlays.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';

describe('Filters app effects', () => {
	let filtersAppEffects: FiltersAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	const selectedCase: Case = {
		id: 'case1',
		state: {
			maps: {
				activeMapId: '5555',
				data: [{ id: '5555', data: {} }, { id: '4444', data: {} }]
			},
			facets: {
				filters: null
			},
			favoritesOverlays: ['2']
		}
	} as any;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[filtersFeatureKey]: FiltersReducer,
					[overlaysFeatureKey]: OverlayReducer
				})
			],
			providers: [
				FiltersAppEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		store.dispatch(new SelectCaseAction(selectedCase));
	}));

	beforeEach(inject([FiltersAppEffects], (_filtersAppEffects: FiltersAppEffects) => {
		filtersAppEffects = _filtersAppEffects;
	}));

	it('updateOverlayFilters$ effect', () => {
		actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });
		const expectedResults = cold('--b--', {
			b: new SetFiltersAction({
				parsedFilters: [],
				favorites: selectedCase.state.favoritesOverlays,
				showOnlyFavorites: false
			})
		});
		expect(filtersAppEffects.updateOverlayFilters$).toBeObservable(expectedResults);
	});

	it('updateCaseFacets$ effect', (done) => {
		actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });

		store.select(filtersStateSelector).subscribe(filtersState => {
			store.select(casesStateSelector).pluck('selectedCase').subscribe(selectedCase => {
				const update = filtersAppEffects.updateCaseFacets(selectedCase, filtersState);
				const expectedResults = cold('--b--', { b: new UpdateCaseAction(update) });
				expect(filtersAppEffects.updateCaseFacets$).toBeObservable(expectedResults);
				done();
			});
		});
	});

	it('initializeFilters$ effect', (done) => {
		actions = hot('--a--', { a: new LoadOverlaysSuccessAction([]) });

		store.select(overlaysStateSelector).subscribe(overlaysState => {
			const overlays = Array.from(overlaysState.overlays.values());
			store.select(casesStateSelector).pluck('selectedCase').subscribe(selectedCase => {
				const facets = (<Case>selectedCase).state.facets;
				const expectedResults = cold('--b--', { b: new InitializeFiltersAction({ overlays, facets }) });
				expect(filtersAppEffects.initializeFilters$).toBeObservable(expectedResults);
				done();
			});
		});
	});

	it('resetFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysAction() });
		const expectedResults = cold('--b--', { b: new ResetFiltersAction() });
		expect(filtersAppEffects.resetFilters$).toBeObservable(expectedResults);
	});

	it('updateCaseFacets function', (done) => {
		store.select(filtersStateSelector).subscribe(filtersState => {
			store.select(casesStateSelector).pluck('selectedCase').subscribe(selectedCase => {
				(<any>selectedCase).state.facets = { filters: [], showOnlyFavorites: false };

				const update = filtersAppEffects.updateCaseFacets(selectedCase, filtersState);
				expect(update).toEqual(selectedCase);
				done();
			});
		});
	});

	describe('isMetadataEmpty', () => {
		const empty = [undefined, null, []];
		empty.forEach(metadata => {
			it('should "' + JSON.stringify(metadata) + '" be an empty metadata', () => {
				expect(filtersAppEffects.isMetadataEmpty(metadata)).toBeTruthy();
			});
		});

		const full = [0, false, [0]];
		full.forEach(metadata => {
			it('should "' + JSON.stringify(metadata) + '" not be an empty metadata', () => {
				expect(filtersAppEffects.isMetadataEmpty(metadata)).toBeFalsy();
			});
		});
	});
});
