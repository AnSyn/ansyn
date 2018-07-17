import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { SelectCaseAppEffects } from '@ansyn/ansyn/app-effects/effects/cases/select-case.app.effects';

import { cold, hot } from 'jasmine-marbles';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetFavoriteOverlaysAction,
	SetLayoutAction,
	SetOverlaysCriteriaAction
} from '@ansyn/core/actions/core.actions';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { HttpClientModule } from '@angular/common/http';
import {
	ICase,
	ICaseDataInputFiltersState,
	ICaseFacetsState,
	ICaseLayersState,
	ICaseMapsState,
	CaseOrientation,
	CaseRegionState,
	ICaseState,
	CaseTimeFilter,
	ICaseTimeState,
	IContextEntity,
	IOverlaysManualProcessArgs
} from '@ansyn/core/models/case.model';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { SetAnnotationsLayer, UpdateOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateFacetsAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { SetContextParamsAction } from '@ansyn/context/actions/context.actions';

describe('SelectCaseAppEffects', () => {
	let selectCaseAppEffects: SelectCaseAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				HttpClientModule
			],
			providers: [
				SelectCaseAppEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([SelectCaseAppEffects], (_selectCaseAppEffects: SelectCaseAppEffects) => {
		selectCaseAppEffects = _selectCaseAppEffects;
	}));

	it('should be defined', () => {
		expect(selectCaseAppEffects).toBeDefined();
	});

	describe('selectCase$', () => {
		it('should set all feature stores properties', () => {
			const
				orientation: CaseOrientation = 'Imagery Perspective',
				timeFilter: CaseTimeFilter = 'Start - End',
				time: ICaseTimeState = { type: 'absolute', from: new Date(0), to: new Date(0) },
				region: CaseRegionState = {},
				dataInputFilters: ICaseDataInputFiltersState = { fullyChecked: true, filters: [], active: true },
				favoriteOverlays: IOverlay[] = [],
				maps: ICaseMapsState = { activeMapId: 'activeMapId', data: [], layout: 'layout6' },
				layers: ICaseLayersState = { activeLayersIds: [], displayAnnotationsLayer: false, annotationsLayer: <any> {} },
				overlaysManualProcessArgs: IOverlaysManualProcessArgs = {},
				facets: ICaseFacetsState = { showOnlyFavorites: true, filters: [] },
				contextEntities: IContextEntity[] = [{id: '234', date: new Date(), featureJson: null}],
				noInitialSearch = true;

			const state: ICaseState = <any> {
				orientation,
				timeFilter,
				time,
				region,
				dataInputFilters,
				favoriteOverlays,
				maps,
				layers,
				overlaysManualProcessArgs,
				facets,
				contextEntities,
				noInitialSearch
			};

			const payload: ICase = {
				id: 'caseId',
				name: 'caseName',
				owner: 'ownerName',
				lastModified: new Date(),
				creationTime: new Date(),
				autoSave: false,
				state
			};

			actions = hot('--a--', { a: new SelectCaseAction(payload) });

			const expectedResult = cold('--(abcdefghijk)--', {
				a: new SetLayoutAction(<any>maps.layout),
				b: new SetComboBoxesProperties({ orientation, timeFilter }),
				c: new SetOverlaysCriteriaAction({ time, region, dataInputFilters, noInitialSearch }),
				d: new SetMapsDataActionStore({ mapsList: maps.data, activeMapId: maps.activeMapId }),
				e: new SetFavoriteOverlaysAction(favoriteOverlays),
				f: new BeginLayerCollectionLoadAction(),
				g: new SetAnnotationsLayer(layers.annotationsLayer),
				h: new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
				i: new UpdateFacetsAction(facets),
				j: new UpdateSelectedLayersIds([]),
				k: new SetContextParamsAction({ contextEntities })

		});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult);
		});
	});
});
