import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { SelectOverlayAction, UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { UpdateCaseSuccessAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { HttpModule } from '@angular/http';
import { CasesReducer } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn//menu-items/cases/reducers/cases.reducer';
import { PositionChangedAction } from '@ansyn/map-facade/actions/map.actions';
import { Position } from '@ansyn/core';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let effectsRunner: EffectsRunner;
	let casesService: CasesService;
	let store: Store<any>;
	let icase_state: ICasesState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ overlays: OverlayReducer, cases: CasesReducer })],
			providers: [CasesAppEffects, CasesService]

		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;

		icase_state = {
			cases: [
				{
					id: 'case1',
					state: {
						selected_overlays_ids: []
					}
				}
			],
			selected_case_id: 'case1'
		} as any;

		spyOn(store, 'select').and.callFake(() => {
			return Observable.of(icase_state);
		});

	}));

	beforeEach(inject([CasesAppEffects, EffectsRunner, CasesService], (_casesAppEffects: CasesAppEffects, _effectsRunner: EffectsRunner, _casesService: CasesService) => {
		casesAppEffects = _casesAppEffects;
		effectsRunner = _effectsRunner;
		casesService = _casesService;
	}));

	it('selectOverlay$ should push overlay.id to selected_overlays_ids on cases', () => {
		let selected_case: Case = icase_state.cases[0];

		spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(selected_case));

		effectsRunner.queue(new SelectOverlayAction("1234-5678"));
		let result: UpdateCaseSuccessAction;
		casesAppEffects.selectOverlay$.subscribe((_result: UpdateCaseSuccessAction) => {
			result = _result;
		});

		expect(result instanceof UpdateCaseSuccessAction).toBeTruthy();
		expect(result.payload).toEqual(selected_case);
		expect(selected_case.state.selected_overlays_ids).toEqual(["1234-5678"]);
		expect(casesService.updateCase).toHaveBeenCalledWith(selected_case);

	});

	it('unSelectOverlay$ should delete overlay.id to selected_overlays_ids on cases', () => {
		let selected_case: Case = icase_state.cases[0];
		selected_case.state.selected_overlays_ids = ["1234-5678"]
		spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(selected_case));

		effectsRunner.queue(new UnSelectOverlayAction("1234-5678"));
		let result: UpdateCaseSuccessAction;
		casesAppEffects.unSelectOverlay$.subscribe((_result: UpdateCaseSuccessAction) => {
			result = _result;
		});

		expect(result instanceof UpdateCaseSuccessAction).toBeTruthy();
		expect(result.payload).toEqual(selected_case);
		expect(selected_case.state.selected_overlays_ids).toEqual([]);
		expect(casesService.updateCase).toHaveBeenCalledWith(selected_case);
	});

	it('positionChanged$ should save the position from PositionChange Action to selected_case', () => {
		let selected_case: Case = icase_state.cases[0];

		spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(selected_case));

		let position: Position = {
			zoom: 1,
			center: "" as any
		};

		effectsRunner.queue(new PositionChangedAction(position));
		let result: UpdateCaseSuccessAction;
		casesAppEffects.positionChanged$.subscribe((_result: UpdateCaseSuccessAction) => {
			result = _result;
		});

		expect(result instanceof UpdateCaseSuccessAction).toBeTruthy();
		expect(result.payload).toEqual(selected_case);
		expect(selected_case.state.maps[0].position).toEqual(position);
		expect(casesService.updateCase).toHaveBeenCalledWith(selected_case);
	});


});
