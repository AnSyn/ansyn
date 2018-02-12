import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/Observable';
import { SelectCaseAppEffects } from '@ansyn/app/app-effects/effects/cases/select-case.app.effects';
import {
	Case, CaseGeoFilter, CaseLayersState, CaseMapsState, CaseOrientation, CaseRegionState, CaseState, CaseTimeFilter,
	CaseTimeState
} from '@ansyn/core';
import { SelectCaseAction } from '@ansyn/menu-items';
import { cold, hot } from 'jasmine-marbles';
import {
	SetAnnotationsLayer,
	ToggleDisplayAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ChangeLayoutAction, SetComboBoxesProperties, SetTimeAction } from '@ansyn/status-bar';
import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { SetFavoriteOverlaysAction } from '@ansyn/core/actions/core.actions';
import { SetRegionAction } from '@ansyn/map-facade';
import { Overlay } from '@ansyn/core/models/overlay.model';

describe('UpdateCaseAppEffects', () => {
	let selectCaseAppEffects: SelectCaseAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
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
				geoFilter: CaseGeoFilter = 'Pin-Point',
				timeFilter: CaseTimeFilter = 'Start - End',
				time: CaseTimeState = { type: 'absolute', from: '', to: '' },
				region: CaseRegionState = {},
				favoriteOverlays: Overlay[] = [],
				maps: CaseMapsState = { activeMapId: 'activeMapId', data: [], layoutsIndex: 6 },
				layers: CaseLayersState = { displayAnnotationsLayer: false, annotationsLayer: <any> {} };

			const state: CaseState = <any> { orientation, geoFilter, timeFilter, time, region, favoriteOverlays, maps, layers };

			const payload: Case = {
				id: 'caseId',
				name: 'caseName',
				lastModified: new Date(),
				state
			};

			actions = hot('--a--', { a: new SelectCaseAction(payload) })

			const expectedResult = cold('--(abcdefgh)--', {
				a: new ChangeLayoutAction(+maps.layoutsIndex),
				b: new SetComboBoxesProperties({ orientation, geoFilter, timeFilter }),
				c: new SetTimeAction(time),
				d: new SetRegionAction(region),
				e: new SetMapsDataActionStore({ mapsList: maps.data, activeMapId: maps.activeMapId }),
				f: new SetFavoriteOverlaysAction(favoriteOverlays),
				g: new SetAnnotationsLayer(layers.annotationsLayer),
				h: new ToggleDisplayAnnotationsLayer(layers.displayAnnotationsLayer),
			});

			expect(selectCaseAppEffects.selectCase$).toBeObservable(expectedResult)
		});
	});
});
