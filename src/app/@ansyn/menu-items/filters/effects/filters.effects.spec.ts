import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';

import {
	buildFilteredOverlays,
	coreFeatureKey,
	CoreReducer,
	FilterType,
	IOverlay,
	SetFavoriteOverlaysAction
} from '@ansyn/core';
import {
	LoadOverlaysAction,
	OverlayReducer,
	overlaysFeatureKey,
	OverlaysService,
	overlaysStatusMessages,
	SetDropsAction,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessage
} from '@ansyn/overlays';
import { menuFeatureKey, MenuReducer, SetBadgeAction } from '@ansyn/menu';
import { FiltersEffects } from './filters.effects';
import { FilterMetadata } from '../models/metadata/filter-metadata.interface';
import { EnumFilterMetadata } from '../models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '../models/metadata/slider-filter-metadata';
import { IFilter } from '../models/IFilter';
import { filtersFeatureKey, FiltersReducer } from '../reducer/filters.reducer';
import { filtersConfig } from '../services/filters.service';

describe('Filters app effects', () => {
	let filtersEffects: FiltersEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	const filterMetadata: FilterMetadata = new EnumFilterMetadata(null, null);
	const filterMetadata2: FilterMetadata = new EnumFilterMetadata(null, null);
	const filterMetadata3: FilterMetadata = new SliderFilterMetadata(null, null);
	const filterMetadata4: FilterMetadata = new SliderFilterMetadata(null, null);
	const filterKey: IFilter = { modelName: 'enumModel1', displayName: 'Enum Model', type: FilterType.Enum };
	const filterKey2: IFilter = { modelName: 'enumModel2', displayName: 'Enum Model 2', type: FilterType.Enum };
	const filterKey3: IFilter = { modelName: 'SliderModel', displayName: 'Slider Model', type: FilterType.Slider };
	const filterKey4: IFilter = { modelName: 'SliderModel2', displayName: 'Slider Model2', type: FilterType.Slider };
	const filters = new Map([[filterKey, filterMetadata], [filterKey2, filterMetadata2], [filterKey3, filterMetadata3], [filterKey4, filterMetadata4]]);

	const favoriteOver = <IOverlay> {};
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
				FiltersEffects,
				{ provide: filtersConfig, useValue: {} },
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([FiltersEffects, Store], (_filtersEffects: FiltersEffects, _store: Store<any>) => {
		filtersEffects = _filtersEffects;
		store = _store;
	}));

	it('updateOverlayFilters$ effect', () => {
		const fakeObj = {
			buildFilteredOverlays: buildFilteredOverlays
		};
		spyOn(fakeObj, 'buildFilteredOverlays').and.callFake(() => []);
		store.dispatch(new InitializeFiltersSuccessAction(new Map()));
		const expectedResults = cold('(bc)', {
			b: new SetFilteredOverlaysAction([]),
			c: new SetOverlaysStatusMessage(overlaysStatusMessages.noOverLayMatchFilters)
		});
		expect(filtersEffects.updateOverlayFilters$).toBeObservable(expectedResults);
	});

	it('updateOverlayDrops$ effect', () => {
		spyOn(OverlaysService, 'parseOverlayDataForDisplay').and.callFake(() => []);
		const expectedResults = cold('(b)', {
			b: new SetDropsAction([])
		});
		expect(filtersEffects.updateOverlayDrops$).toBeObservable(expectedResults);
	});

	it('initializeFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysAction(<any> {}) });
		const expectedResults = cold('--b--', { b: new InitializeFiltersAction() });
		expect(filtersEffects.initializeFilters$).toBeObservable(expectedResults);
	});

	it('updateFiltersBadge$ should calculate filters number', () => {
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example', {
			count: 10,
			filteredCount: 0,
			isChecked: true
		}); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example2', {
			count: 10,
			filteredCount: 0,
			isChecked: false
		}); // (!isChecked) => 1

		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example', {
			count: 10,
			filteredCount: 0,
			isChecked: true
		}); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example2', {
			count: 10,
			filteredCount: 0,
			isChecked: false
		}); // (!isChecked) => 2

		(<SliderFilterMetadata>filterMetadata3).min = -2;
		(<SliderFilterMetadata>filterMetadata3).max = 2; // (start = -Infinity && end = Infinity ) => no changes

		(<SliderFilterMetadata>filterMetadata3).start = -2;
		(<SliderFilterMetadata>filterMetadata3).end = 1; // (start > -Infinity || end < Infinity ) => 3
		store.dispatch(new InitializeFiltersSuccessAction(filters));
		const expectedResults = cold('b', { b: new SetBadgeAction({ key: 'Filters', badge: '3' }) });
		expect(filtersEffects.updateFiltersBadge$).toBeObservable(expectedResults);
	});

	it('setShowFavoritesFlagOnFilters$', () => {
		const overlays = [<IOverlay> {}, <IOverlay> {}];
		store.dispatch(new SetFavoriteOverlaysAction(overlays));
		const expectedResults = cold('b', { b: new EnableOnlyFavoritesSelectionAction(true) });
		expect(filtersEffects.setShowFavoritesFlagOnFilters$).toBeObservable(expectedResults);
	});
});
