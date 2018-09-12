import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { cold, hot } from 'jasmine-marbles';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import {
	SetAutoSave,
	SetFavoriteOverlaysAction,
	SetLayoutAction, SetMapsDataActionStore,
	SetOverlaysCriteriaAction,
	SetPresetOverlaysAction,
	SetRemovedOverlaysIdsAction, SetRemovedOverlaysVisibilityAction
} from '@ansyn/core';
import { IOverlay } from '@ansyn/core';
import { HttpClientModule } from '@angular/common/http';
import {
	CaseOrientation,
	CaseRegionState,
	CaseTimeFilter,
	ICase,
	ICaseDataInputFiltersState,
	ICaseFacetsState,
	ICaseLayersState,
	ICaseMapsState,
	ICaseState,
	ICaseTimeState,
	IContextEntity,
	IOverlaysManualProcessArgs
} from '@ansyn/core';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { UpdateOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateFacetsAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { SetContextParamsAction } from '@ansyn/context';
import { CoreConfig } from '@ansyn/core';
import { SelectCaseAppEffects } from './select-case.app.effects';

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
				provideMockActions(() => actions),
				{ provide: CoreConfig, useValue: {} }
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
				removedOverlaysIds: string[] = [],
				removedOverlaysVisibility = true,
				presetOverlays: IOverlay[] = [],
				maps: ICaseMapsState = { activeMapId: 'activeMapId', data: [], layout: 'layout6' },
				layers: ICaseLayersState = {
					activeLayersIds: []
				},
				overlaysManualProcessArgs: IOverlaysManualProcessArgs = {},
				facets: ICaseFacetsState = { showOnlyFavorites: true, filters: [] },
				contextEntities: IContextEntity[] = [{ id: '234', date: new Date(), featureJson: null }]
			;

			let noInitialSearch;

			const state: ICaseState = <any> {
				orientation,
				timeFilter,
				time,
				region,
				dataInputFilters,
				favoriteOverlays,
				removedOverlaysVisibility,
				removedOverlaysIds,
				presetOverlays,
				maps,
				layers,
				overlaysManualProcessArgs,
				facets,
				contextEntities
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

			const expectedResult = cold('--(abcdefghijklmn)--', {
				a: new SetLayoutAction(<any>maps.layout),
				b: new SetComboBoxesProperties({ orientation, timeFilter }),
				c: new SetOverlaysCriteriaAction({ time, region, dataInputFilters }, { noInitialSearch }),
				d: new SetMapsDataActionStore({ mapsList: maps.data, activeMapId: maps.activeMapId }),
				e: new SetFavoriteOverlaysAction(favoriteOverlays),
				f: new SetPresetOverlaysAction(presetOverlays),
				g: new BeginLayerCollectionLoadAction({ caseId: payload.id }),
				h: new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
				i: new UpdateFacetsAction(facets),
				j: new UpdateSelectedLayersIds([]),
				k: new SetContextParamsAction({ contextEntities }),
				l: new SetAutoSave(false),
				m: new SetRemovedOverlaysIdsAction(removedOverlaysIds),
				n: new SetRemovedOverlaysVisibilityAction(removedOverlaysVisibility)
			});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult);
		});
	});
});
