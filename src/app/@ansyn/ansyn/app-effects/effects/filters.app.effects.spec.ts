import { FiltersAppEffects } from './filters.app.effects';
import { Observable } from 'rxjs/Observable';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector, ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import {
	filtersFeatureKey,
	FiltersReducer,
	filtersStateSelector, IFiltersState,
	initialFiltersState
} from '@ansyn/menu-items/filters/reducer/filters.reducer';
import {
	InitializeFiltersAction,
	InitializeFiltersSuccessAction,
	ResetFiltersAction
} from '@ansyn/menu-items/filters/actions/filters.actions';
import { Case } from '@ansyn/core/models/case.model';
import {
	IOverlaysState,
	OverlayReducer,
	overlaysFeatureKey,
	overlaysInitialState,
	overlaysStateSelector
} from '@ansyn/overlays/reducers/overlays.reducer';
import { LoadOverlaysAction, LoadOverlaysSuccessAction, SetFilteredOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';
import { Filter } from '@ansyn/menu-items/filters/models/filter';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SetBadgeAction } from '@ansyn/menu/actions/menu.actions';
import { initialMenuState, menuFeatureKey, MenuReducer, menuStateSelector } from '@ansyn/menu/reducers/menu.reducer';
import 'rxjs/add/observable/of';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import { coreInitialState, coreStateSelector } from '@ansyn/core/reducers/core.reducer';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { SliderFilterMetadata } from '@ansyn/menu-items';
import { overlaysStatusMessages, SetOverlaysStatusMessage } from '@ansyn/overlays';

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

	const favoriteOver = new Overlay();
	favoriteOver.id = '2';

	const filtersState = <IFiltersState> { ...initialFiltersState };
	const casesState = <ICasesState> { ...initialCasesState };
	const overlaysState = <IOverlaysState> { ...overlaysInitialState };

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
			favoriteOverlays: [favoriteOver]
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
		const fakeStore = new Map(<any>[
			[overlaysStateSelector, overlaysState],
			[filtersStateSelector, filtersState],
			[casesStateSelector, casesState],
			[menuStateSelector, { ...initialMenuState }],
			[coreStateSelector, { ...coreInitialState, favoriteOverlays: [favoriteOver] }]
		]);
		filtersState.filters = new Map();
		casesState.selectedCase = selectedCase;
		spyOn(store, 'select').and.callFake((type) => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([FiltersAppEffects], (_filtersAppEffects: FiltersAppEffects) => {
		filtersAppEffects = _filtersAppEffects;
	}));

	it('updateOverlayFilters$ effect', () => {
		overlaysState.loaded  = true;
		const filteredOverlays = [];
		filtersState.filters = new Map();
		spyOn(filtersAppEffects, 'buildFilteredOverlays').and.callFake(() => filteredOverlays);
		actions = hot('--a--', { a: new InitializeFiltersSuccessAction(null) });
		const expectedResults = cold('--(bc)--', {
			b: new SetFilteredOverlaysAction(filteredOverlays),
			c: new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchFilters)
		});
		expect(filtersAppEffects.updateOverlayFilters$).toBeObservable(expectedResults);
	});

	it('initializeFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysSuccessAction([]) });
		const overlays = Array.from(overlaysState.overlays.values());
		const facets = (<Case>selectedCase).state.facets;
		const expectedResults = cold('--b--', { b: new InitializeFiltersAction({ overlays, facets }) });
		expect(filtersAppEffects.initializeFilters$).toBeObservable(expectedResults);
	});

	it('resetFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysAction(<any>null) });
		const expectedResults = cold('--b--', { b: new ResetFiltersAction() });
		expect(filtersAppEffects.resetFilters$).toBeObservable(expectedResults);
	});

	it('updateFiltersBadge$ should calculate filters number', () => {
		filtersState.filters = filters;
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

	it('setShowFavoritesFlagOnFilters$', () => {
		const overlays = [new Overlay(), new Overlay()];
		actions = hot('--a--', { a: new SetFavoriteOverlaysAction(overlays) });
		const expectedResults = cold('--b--', { b: new EnableOnlyFavoritesSelectionAction(true) });
		expect(filtersAppEffects.setShowFavoritesFlagOnFilters$).toBeObservable(expectedResults);
	});
});
