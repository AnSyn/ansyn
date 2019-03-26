import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { cold, hot } from 'jasmine-marbles';
import {
	BeginLayerCollectionLoadAction, CasesService,
	SelectCaseAction, SelectCaseSuccessAction,
	UpdateFacetsAction,
	UpdateOverlaysManualProcessArgs,
	UpdateSelectedLayersIds
} from '../../../modules/menu-items/public_api';
import {
	CaseOrientation,
	CaseRegionState,
	CaseTimeFilter,
	CoreConfig,
	ICase,
	ICaseDataInputFiltersState,
	ICaseFacetsState,
	ICaseLayersState,
	ICaseMapsState,
	ICaseState,
	ICaseTimeState,
	IContextEntity,
	IOverlay,
	IOverlaysManualProcessArgs,
	SetAutoSave,
	SetContextParamsAction,
	SetFavoriteOverlaysAction,
	SetLayoutAction,
	SetOverlaysCriteriaAction,
	SetPresetOverlaysAction,
	SetRemovedOverlaysIdsAction,
	SetRemovedOverlaysVisibilityAction
} from '../../../modules/core/public_api';
import { HttpClientModule } from '@angular/common/http';
import { SetComboBoxesProperties } from '../../../modules/status-bar/public_api';
import { SelectCaseAppEffects } from './select-case.app.effects';
import { SetActiveMapId, SetMapsDataActionStore } from '@ansyn/map-facade';

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
				{ provide: CoreConfig, useValue: {} },
				{ provide: CasesService, useValue: {} }
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

			const expectedResult = cold('--(abcdefghijklmnop)--', {
				a: new SetLayoutAction(<any>maps.layout),
				b: new SetComboBoxesProperties({ orientation, timeFilter }),
				c: new SetOverlaysCriteriaAction({ time, region, dataInputFilters }, { noInitialSearch }),
				d: new SetMapsDataActionStore({ mapsList: maps.data }),
				e: new SetActiveMapId(maps.activeMapId),
				f: new SetFavoriteOverlaysAction(favoriteOverlays),
				g: new SetPresetOverlaysAction(presetOverlays),
				h: new BeginLayerCollectionLoadAction({ caseId: payload.id }),
				i: new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
				j: new UpdateFacetsAction(facets),
				k: new UpdateSelectedLayersIds([]),
				l: new SetContextParamsAction({ contextEntities }),
				m: new SetAutoSave(false),
				n: new SetRemovedOverlaysIdsAction(removedOverlaysIds),
				o: new SetRemovedOverlaysVisibilityAction(removedOverlaysVisibility),
				p: new SelectCaseSuccessAction(payload)
			});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult);
		});
	});
});
