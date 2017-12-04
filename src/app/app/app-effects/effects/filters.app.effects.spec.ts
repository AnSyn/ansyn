import { FiltersAppEffects } from './filters.app.effects';
import { Observable } from 'rxjs/Observable';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { casesFeatureKey, CasesReducer, casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	filtersFeatureKey,
	FiltersReducer,
	filtersStateSelector
} from '@ansyn/menu-items/filters/reducer/filters.reducer';
import { SetFiltersAction, SliderFilterMetadata, UpdateCaseAction } from '../../../index';
import { InitializeFiltersSuccessAction, ResetFiltersAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { OverlayReducer, overlaysFeatureKey } from '@ansyn/overlays/reducers/overlays.reducer';
import { LoadOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';
import { Filter } from '@ansyn/menu-items/filters/models/filter';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SetBadgeAction } from '@ansyn/menu/actions/menu.actions';
import { menuFeatureKey, MenuReducer } from '@ansyn/menu/reducers/menu.reducer';
import { LoadOverlaysSuccessAction } from '../../../packages/overlays/actions/overlays.actions';
import { overlaysStateSelector } from '../../../packages/overlays/reducers/overlays.reducer';
import { InitializeFiltersAction } from '../../../packages/menu-items/filters/actions/filters.actions';

describe('Filters app effects', () => {
	let filtersAppEffects: FiltersAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	const filterMetadata: FilterMetadata = new EnumFilterMetadata();
	const filterMetadata2: FilterMetadata = new EnumFilterMetadata();
	const filterMetadata3: FilterMetadata = new SliderFilterMetadata();
	const filterMetadata4: FilterMetadata = new SliderFilterMetadata();

	const filterKey: Filter = { modelName: 'enumModel1', displayName: 'Enum Model', type: 'Enum' };
	const filterKey2: Filter = { modelName: 'enumModel2', displayName: 'Enum Model 2', type: 'Enum' };
	const filterKey3: Filter = { modelName: 'SliderModel', displayName: 'Slider Model', type: 'Slider' };
	const filterKey4: Filter = { modelName: 'SliderModel2', displayName: 'Slider Model2', type: 'Slider' };

	const filters = new Map([[filterKey, filterMetadata], [filterKey2, filterMetadata2], [filterKey3, filterMetadata3], [filterKey4, filterMetadata4]]);


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
					[overlaysFeatureKey]: OverlayReducer,
					[menuFeatureKey]: MenuReducer
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
		store.dispatch(new InitializeFiltersSuccessAction(filters));
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

	// @ToDo test for updateCaseFacets$ effect without 'select'
	// it('updateCaseFacets$ effect', (done) => {
	// 	actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });
	// 	store.select(filtersStateSelector).subscribe(filtersState => {
	// 		store.select(casesStateSelector).pluck('selectedCase').subscribe(selectedCase => {
	// 			const update = filtersAppEffects.updateCaseFacets(selectedCase, filtersState);
	// 			const expectedResults = cold('--b--', { b: new UpdateCaseAction(update) });
	// 			expect(filtersAppEffects.updateCaseFacets$).toBeObservable(expectedResults);
	// 			done();
	// 		});
	// 	});
	// });

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

	it('updateFiltersBadge$ should calculate filters number', () => {
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example', { count: 10, isChecked: true }); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example2', { count: 10, isChecked: false }); // (!isChecked) => 1

		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example', { count: 10, isChecked: true }); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example2', { count: 10, isChecked: false }); // (!isChecked) => 2

		(<SliderFilterMetadata>filterMetadata3).start = -Infinity;
		(<SliderFilterMetadata>filterMetadata3).end = Infinity; // (start = -Infinity && end = Infinity ) => no changes

		(<SliderFilterMetadata>filterMetadata3).start = -2;
		(<SliderFilterMetadata>filterMetadata3).end = 2; // (start !== -Infinity || end !== Infinity ) => 3

		actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });
		const expectedResults = cold('--b--', { b: new SetBadgeAction({ key: 'Filters', badge: '3' }) });
		expect(filtersAppEffects.updateFiltersBadge$).toBeObservable(expectedResults);
	});

	// @ToDo test for updateCaseFacets function without 'select'
	// fit('updateCaseFacets function', (done) => {
	// 	store.select(filtersStateSelector).subscribe(filtersState => {
	// 		store.select(casesStateSelector).pluck('selectedCase').subscribe(selectedCase => {
	// 			(<any>selectedCase).state.facets = { filters: [], showOnlyFavorites: false };
	// 			const update = filtersAppEffects.updateCaseFacets(selectedCase, filtersState);
	// 			expect(update).toEqual(selectedCase);
	// 			done();
	// 		});
	// 	});
	// });

	describe('isMetadataEmpty', () => {
		const empty = [undefined, null];
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
