import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/Observable';
import { SelectCaseAppEffects } from '@ansyn/ansyn/app-effects/effects/cases/select-case.app.effects';

import { cold, hot } from 'jasmine-marbles';
import {
	BeginLayerCollectionLoadAction,
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetFavoriteOverlaysAction,
	SetLayoutAction,
	SetOverlaysCriteriaAction
} from '@ansyn/core/actions/core.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { HttpClientModule } from '@angular/common/http';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import {
	Case,
	CaseDataInputFiltersState,
	CaseFacetsState,
	CaseGeoFilter,
	CaseLayersState,
	CaseMapsState,
	CaseOrientation,
	CaseRegionState,
	CaseState,
	CaseTimeFilter,
	CaseTimeState,
	OverlaysManualProcessArgs
} from '@ansyn/core/models/case.model';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { SetComboBoxesProperties } from '@ansyn/status-bar/actions/status-bar.actions';
import { UpdateOverlaysManualProcessArgs } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateFacetsAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { ContextService } from '@ansyn/context/services/context.service';

describe('SelectCaseAppEffects', () => {
	let selectCaseAppEffects: SelectCaseAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let mockCasesService = {
		contextValues: {
			imageryCountBefore: -1,
			imageryCountAfter: -1
		}
	};

	let mockOverlaysService = {
		getStartDateViaLimitFacets: () => Observable.of({ startDate: new Date(), endDate: new Date() }),
		getStartAndEndDateViaRangeFacets: () => Observable.of({ startDate: new Date(), endDate: new Date() })
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				HttpClientModule
			],
			providers: [
				SelectCaseAppEffects,
				{
					provide: CasesService,
					useValue: mockCasesService
				},
				{
					provide: ContextService,
					useValue: {}
				},
				{
					provide: OverlaysService,
					useValue: mockOverlaysService
				},
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
				geoFilter: CaseGeoFilter = CaseGeoFilter.PinPoint,
				timeFilter: CaseTimeFilter = 'Start - End',
				time: CaseTimeState = { type: 'absolute', from: new Date(0), to: new Date(0) },
				region: CaseRegionState = {},
				dataInputFilters: CaseDataInputFiltersState = { filters: [], active: true },
				favoriteOverlays: Overlay[] = [],
				maps: CaseMapsState = { activeMapId: 'activeMapId', data: [], layout: 'layout6' },
				layers: CaseLayersState = { displayAnnotationsLayer: false, annotationsLayer: <any> {} },
				overlaysManualProcessArgs: OverlaysManualProcessArgs = {},
				facets: CaseFacetsState = { showOnlyFavorites: true, filters: [] };

			const state: CaseState = <any> {
				orientation,
				geoFilter,
				timeFilter,
				time,
				region,
				dataInputFilters,
				favoriteOverlays,
				maps,
				layers,
				overlaysManualProcessArgs,
				facets
			};

			const payload: Case = {
				id: 'caseId',
				name: 'caseName',
				owner: 'ownerName',
				lastModified: new Date(),
				creationTime: new Date(),
				state
			};

			actions = hot('--a--', { a: new SelectCaseAction(payload) });

			const expectedResult = cold('--(abcdefghij)--', {
				a: new SetLayoutAction(<any>maps.layout),
				b: new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
				c: new SetOverlaysCriteriaAction({ time, region, dataInputFilters }),
				d: new SetMapsDataActionStore({ mapsList: maps.data, activeMapId: maps.activeMapId }),
				e: new SetFavoriteOverlaysAction(favoriteOverlays),
				f: new BeginLayerCollectionLoadAction(),
				g: new SetAnnotationsLayer(layers.annotationsLayer),
				h: new ToggleDisplayAnnotationsLayer(layers.displayAnnotationsLayer),
				i: new UpdateOverlaysManualProcessArgs({ override: true, data: overlaysManualProcessArgs }),
				j: new UpdateFacetsAction(facets)
			});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult);
		});
	});
});
