import { FiltersAppEffects } from './filters.app.effects';
import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { filtersFeatureKey, FiltersReducer } from '@ansyn/menu-items';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction,
	ResetFiltersAction
} from '@ansyn/menu-items';
import { FilterType } from '@ansyn/core';
import { OverlayReducer, overlaysFeatureKey, overlaysStatusMessages } from '@ansyn/overlays';
import {
	LoadOverlaysAction,
	LoadOverlaysSuccessAction,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessage
} from '@ansyn/overlays';
import { IFilter } from '@ansyn/menu-items';
import { FilterMetadata } from '@ansyn/menu-items';
import { EnumFilterMetadata } from '@ansyn/menu-items';
import { SetBadgeAction } from '@ansyn/menu';
import { menuFeatureKey, MenuReducer } from '@ansyn/menu';
import 'rxjs/add/observable/of';
import { SetFavoriteOverlaysAction } from '@ansyn/core';
import { coreFeatureKey, CoreReducer } from '@ansyn/core';
import { IOverlay } from '@ansyn/core';
import { SliderFilterMetadata } from '@ansyn/menu-items';
import { OverlaysService } from '@ansyn/overlays';
import { GenericTypeResolverService } from '@ansyn/core';
import { FiltersService } from '@ansyn/menu-items';

describe('Filters app effects', () => {
	let filtersAppEffects: FiltersAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	const filterMetadata: FilterMetadata = new EnumFilterMetadata();
	const filterMetadata2: FilterMetadata = new EnumFilterMetadata();
	const filterMetadata3: FilterMetadata = new SliderFilterMetadata();
	const filterMetadata4: FilterMetadata = new SliderFilterMetadata();
	const filterKey: IFilter = { modelName: 'enumModel1', displayName: 'Enum Model', type: FilterType.Enum };
	const filterKey2: IFilter = { modelName: 'enumModel2', displayName: 'Enum Model 2', type: FilterType.Enum };
	const filterKey3: IFilter = { modelName: 'SliderModel', displayName: 'Slider Model', type: FilterType.Slider };
	const filterKey4: IFilter = { modelName: 'SliderModel2', displayName: 'Slider Model2', type: FilterType.Slider };
	const filters = new Map([[filterKey, filterMetadata], [filterKey2, filterMetadata2], [filterKey3, filterMetadata3], [filterKey4, filterMetadata4]]);

	const favoriteOver =  <IOverlay> {};
	favoriteOver.id = '2';

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[coreFeatureKey]: CoreReducer,
					[filtersFeatureKey]: FiltersReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[menuFeatureKey]: MenuReducer
				})
			],
			providers: [
				FiltersAppEffects,
				GenericTypeResolverService,
				{ provide: FiltersService, useValue: {} },
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([FiltersAppEffects, Store], (_filtersAppEffects: FiltersAppEffects, _store: Store<any>) => {
		filtersAppEffects = _filtersAppEffects;
		store = _store;
	}));

	it('updateOverlayFilters$ effect', () => {
		// spyOn(OverlaysService, 'buildFilteredOverlays').and.callFake(() => []);
		// store.dispatch(new InitializeFiltersSuccessAction(new Map()));
		// const expectedResults = cold('(bc)', {
		// 	b: new SetFilteredOverlaysAction([]),
		// 	c: new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchFilters)
		// });
		// expect(filtersAppEffects.updateOverlayFilters$).toBeObservable(expectedResults);
	});

	it('initializeFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysSuccessAction([]) });
		const expectedResults = cold('--b--', { b: new InitializeFiltersAction() });
		expect(filtersAppEffects.initializeFilters$).toBeObservable(expectedResults);
	});

	it('resetFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysAction(<any>null) });
		const expectedResults = cold('--b--', { b: new ResetFiltersAction() });
		expect(filtersAppEffects.resetFilters$).toBeObservable(expectedResults);
	});

	it('updateFiltersBadge$ should calculate filters number', () => {
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example', { count: 10, filteredCount: 0,  isChecked: true }); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example2', { count: 10, filteredCount: 0, isChecked: false }); // (!isChecked) => 1

		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example', { count: 10, filteredCount: 0, isChecked: true }); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example2', { count: 10, filteredCount: 0, isChecked: false }); // (!isChecked) => 2

		(<SliderFilterMetadata>filterMetadata3).min = -2;
		(<SliderFilterMetadata>filterMetadata3).max = 2; // (start = -Infinity && end = Infinity ) => no changes

		(<SliderFilterMetadata>filterMetadata3).start = -2;
		(<SliderFilterMetadata>filterMetadata3).end = 1; // (start > -Infinity || end < Infinity ) => 3
		store.dispatch(new InitializeFiltersSuccessAction(filters));
		const expectedResults = cold('b', { b: new SetBadgeAction({ key: 'Filters', badge: '3' }) });
		expect(filtersAppEffects.updateFiltersBadge$).toBeObservable(expectedResults);
	});

	it('setShowFavoritesFlagOnFilters$', () => {
		const overlays = [ <IOverlay> {}, <IOverlay> {}];
		store.dispatch(new SetFavoriteOverlaysAction(overlays));
		const expectedResults = cold('b', { b: new EnableOnlyFavoritesSelectionAction(true) });
		expect(filtersAppEffects.setShowFavoritesFlagOnFilters$).toBeObservable(expectedResults);
	});
});
