import { SetFavoriteOverlaysAction } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { FiltersAppEffects } from './filters.app.effects';
import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { menuFeatureKey, MenuReducer, SetBadgeAction, SetHideResultsTableBadgeAction } from '@ansyn/menu';
import {
	EnableOnlyFavoritesSelectionAction,
	InitializeFiltersAction,
	InitializeFiltersSuccessAction
} from '../../modules/filters/actions/filters.actions';
import { EnumFilterMetadata } from '../../modules/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../../modules/filters/models/metadata/filter-metadata.interface';
import { filtersConfig, FiltersService } from '../../modules/filters/services/filters.service';
import { filtersFeatureKey, FiltersReducer } from '../../modules/filters/reducer/filters.reducer';
import { IFilter } from '../../modules/filters/models/IFilter';
import { SliderFilterMetadata } from '../../modules/filters/models/metadata/slider-filter-metadata';
import { GenericTypeResolverService } from '../../modules/core/services/generic-type-resolver.service';
import {
	LoadOverlaysAction, LoadOverlaysSuccessAction,
	SetFilteredOverlaysAction,
	SetOverlaysStatusMessageAction
} from '../../modules/overlays/actions/overlays.actions';
import {
	OverlayReducer,
	overlaysFeatureKey,
	overlaysStatusMessages
} from '../../modules/overlays/reducers/overlays.reducer';
import { imageryStatusFeatureKey, ImageryStatusReducer } from '@ansyn/map-facade';
import { FilterType } from '../../modules/filters/models/filter-type';
import { IOverlay } from '../../modules/overlays/models/overlay.model';
import { TranslateModule } from '@ngx-translate/core';

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

	const favoriteOver = <IOverlay>{};
	favoriteOver.id = '2';

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[filtersFeatureKey]: FiltersReducer,
					[overlaysFeatureKey]: OverlayReducer,
					[menuFeatureKey]: MenuReducer,
					[imageryStatusFeatureKey]: ImageryStatusReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				TranslateModule.forRoot()
			],
			providers: [
				FiltersAppEffects,
				GenericTypeResolverService,
				{ provide: filtersConfig, useValue: {} },
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([FiltersAppEffects, Store], (_filtersAppEffects: FiltersAppEffects, _store: Store<any>) => {
		filtersAppEffects = _filtersAppEffects;
		store = _store;
	}));

	it('initializeFilters$ effect', () => {
		actions = hot('--a--', { a: new LoadOverlaysAction(<any>{}) });
		const expectedResults = cold('--b--', { b: new InitializeFiltersAction() });
		expect(filtersAppEffects.initializeFilters$).toBeObservable(expectedResults);
	});

	it('updateFiltersBadge$ should calculate filters number', () => {
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example', {
			key: 'example',
			count: 10,
			filteredCount: 0,
			isChecked: true
		}); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata).enumsFields.set('example2', {
			key: 'example2',
			count: 10,
			filteredCount: 0,
			isChecked: false
		}); // (!isChecked) => 1

		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example', {
			key: 'example',
			count: 10,
			filteredCount: 0,
			isChecked: true
		}); // (isChecked) => no changes
		(<EnumFilterMetadata>filterMetadata2).enumsFields.set('example2', {
			key: 'example2',
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
		expect(filtersAppEffects.updateFiltersBadge$).toBeObservable(expectedResults);
	});

	it('setShowFavoritesFlagOnFilters$', () => {
		const overlays = [<IOverlay>{}, <IOverlay>{}];
		store.dispatch(new SetFavoriteOverlaysAction(overlays));
		const expectedResults = cold('b', { b: new EnableOnlyFavoritesSelectionAction(true) });
		expect(filtersAppEffects.setShowFavoritesFlagOnFilters$).toBeObservable(expectedResults);
	});

	describe('updateOverlayFilters$ effect', () => {

		beforeEach(() => {
			store.dispatch(new InitializeFiltersSuccessAction(new Map()));
			store.dispatch(new LoadOverlaysSuccessAction([{ id: '1' }] as any));
		});

		it('should send null message if there are filtered overlays', () => {
			const expectedResults = cold('(bcd)', {
				b: new SetFilteredOverlaysAction(['1']),
				c: new SetHideResultsTableBadgeAction(false),
				d: new SetOverlaysStatusMessageAction({ message: null }),
			});

			expect(filtersAppEffects.updateOverlayFilters$).toBeObservable(expectedResults);
		});

		it('should send no overlays message if there aren\'t filtered overlays', () => {
			spyOn(FiltersService, 'pluckFilterModels').and.returnValue([{
				key: 'myFilter',
				filterFunc: () => false
			}]);

			const expectedResults = cold('(bcd)', {
				b: new SetFilteredOverlaysAction([]),
				c: new SetHideResultsTableBadgeAction(false),
				d: new SetOverlaysStatusMessageAction({ message: overlaysStatusMessages.noOverLayMatchFilters }),
			});

			expect(filtersAppEffects.updateOverlayFilters$).toBeObservable(expectedResults);
		});
	});
});
