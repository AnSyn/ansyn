import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { cold, hot } from 'jasmine-marbles';
import { HttpClientModule } from '@angular/common/http';
import {
	SetFavoriteOverlaysAction,
	SetOverlaysScannedAreaDataAction,
	SetOverlaysTranslationDataAction,
} from '../../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { SelectCaseAppEffects } from './select-case.app.effects';
import { SetActiveMapId, SetLayoutAction, SetMapsDataActionStore } from '@ansyn/map-facade';
import {
	BeginLayerCollectionLoadAction,
	UpdateSelectedLayersIds
} from '../../../modules/menu-items/layers-manager/actions/layers.actions';
import { casesConfig, CasesService } from '../../../modules/menu-items/cases/services/cases.service';
import {
	SelectCaseAction,
	SelectCaseSuccessAction,
	SetAutoSave
} from '../../../modules/menu-items/cases/actions/cases.actions';
import { UpdateFacetsAction } from '../../../modules/filters/actions/filters.actions';
import {
	SetAnnotationMode,
	SetMeasureDistanceToolState
} from '../../../modules/menu-items/tools/actions/tools.actions';
import { CoreConfig } from '../../../modules/core/models/core.config';
import { SetMiscOverlays, SetOverlaysCriteriaAction } from '../../../modules/overlays/actions/overlays.actions';
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
	IOverlaysManualProcessArgs
} from '../../../modules/menu-items/cases/models/case.model';
import { IOverlay, IOverlaysHash } from '../../../modules/overlays/models/overlay.model';
import { UpdateGeoFilterStatus } from '../../../modules/status-bar/actions/status-bar.actions';

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
				{ provide: casesConfig, useValue: {defaultCase: {id: 'caseId'}} },
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
				time: ICaseTimeState = { from: new Date(0), to: new Date(0) },
				region: CaseRegionState = {},
				dataInputFilters: ICaseDataInputFiltersState = { fullyChecked: true, filters: [] },
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
				miscOverlays: IOverlaysHash = {},
				overlaysTranslationData = {},
				overlaysScannedAreaData = {}
			;

			let noInitialSearch;

			const state: ICaseState = <any>{
				orientation,
				timeFilter,
				time,
				region,
				dataInputFilters,
				favoriteOverlays,
				removedOverlaysVisibility,
				removedOverlaysIds,
				presetOverlays,
				overlaysTranslationData,
				maps,
				layers,
				overlaysManualProcessArgs,
				facets,
				miscOverlays,
				overlaysScannedAreaData
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

			const expectedResult = cold('--(abcdefghijklmnpq)--', {
				a: new SetMapsDataActionStore({ mapsList: maps.data }),
				b: new SetActiveMapId(maps.activeMapId),
				c: new SetLayoutAction(<any>maps.layout),
				d: new SetOverlaysCriteriaAction({ time, region, dataInputFilters }, { noInitialSearch }),
				e: new UpdateGeoFilterStatus({active: false, type: region.type}),
				f: new SetFavoriteOverlaysAction(favoriteOverlays),
				g: new SetMiscOverlays({ miscOverlays }),
				h: new SetOverlaysTranslationDataAction(overlaysTranslationData),
				i: new SetOverlaysScannedAreaDataAction(overlaysScannedAreaData),
				j: new BeginLayerCollectionLoadAction({ caseId: payload.id }),
				k: new UpdateFacetsAction(facets),
				l: new UpdateSelectedLayersIds([]),
				m: new SetAutoSave(false),
				n: new SetAnnotationMode(null),
				p: new SetMeasureDistanceToolState(false),
				q: new SelectCaseSuccessAction(payload)
			});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult);
		});
	});
});
