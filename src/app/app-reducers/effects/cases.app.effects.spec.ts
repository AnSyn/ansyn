import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { SelectOverlayAction, UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService, casesConfig } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { UpdateCaseSuccessAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { HttpModule } from '@angular/http';
import { CasesReducer,AddCaseSuccessAction } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer, LoadOverlaysAction } from '@ansyn/overlays';
import { ICasesState } from '@ansyn//menu-items/cases/reducers/cases.reducer';
import { CoreModule } from '@ansyn/core';

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let effectsRunner: EffectsRunner;
	let casesService: CasesService;
	let store: Store < any > ;
	let icase_state: ICasesState;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ overlays: OverlayReducer, cases: CasesReducer }),
				CoreModule
			],
			providers: [CasesAppEffects,
				CasesService,
				{ provide: casesConfig, useValue: { casesBaseUrl: null } }]

		}).compileComponents();
	}));

	beforeEach(inject([Store, casesConfig], (_store: Store<any>) => {
		store = _store;

		icase_state = {
			cases: [{
				id: 'case1',
				state: {
					selected_overlays_ids: []
				}
			}],
			selected_case:{
				id: 'case1',
				index: 0
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(icase_state.cases[0]));
		store.dispatch(new SelectCaseAction(icase_state.selected_case.id));
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

	// it('positionChanged$ should save the position from PositionChange Action to selected_case', () => {
	//     let selected_case: Case = icase_state.cases[0];
	//
	//     spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(selected_case));
	//
	//     let position: Position = {
	//         zoom: 1,
	//         center: "" as any
	//     };
	//
	//     effectsRunner.queue(new PositionChangedAction({id: 'imagery1', position}));
	//     let result: UpdateCaseSuccessAction;
	//     casesAppEffects.positionChanged$.subscribe((_result: UpdateCaseSuccessAction) => {
	//         result = _result;
	//     });
	//
	//     expect(result instanceof UpdateCaseSuccessAction).toBeTruthy();
	//     expect(result.payload).toEqual(selected_case);
	//     expect(selected_case.state.maps[0].position).toEqual(position);
	//     expect(casesService.updateCase).toHaveBeenCalledWith(selected_case);
	// });

	it('On selectCase$ call to loadOverlaysAction with case params ', () => {

		const caseItem: Case =  {
			"name": "look here for overlay",
			"owner": "Elisha Auer",
			"last_modified": new Date("2017-05-10T07:43:38.000Z"),
			"state": {
				"maps": [{
					"position": {
						"center": {
							"type": "Point",
							"coordinates": [
								9.146954103469149,
								3.664086952897634
							]
						},
						"zoom": 9
					}
				}],
				"selected_context_id": "1b0854f6-1634-4672-8bc3-4999a9cb18c3",
				"facets": {
					"SensorName": "Welch, Dooley and Labadie",
					"SensorType": "SAR",
					"Stereo": true,
					"Resolution": 6
				},
				"region": {
					"type": "FeatureCollection",
					"features": [{
						"type": "Feature",
						"properties": {
							"MUN_HEB": "Hasharon",
							"MUN_ENG": "Hasharon"
						},
						"geometry": {
							"type": "Polygon",
							"coordinates": [
								[
									[35.71991824722275, 32.709192409794866],
									[35.54566531753454, 32.393992011030576]
								]


							]
						}
					}]
				},
				"time": {
					"type": "absolute",
					"from": new Date("2013-06-27T08:43:03.624Z"),
					"to": new Date("2015-04-17T03:55:12.129Z")
				},
				"selected_overlay_id": "a8289e70-523a-4dbd-9b8f-0d6b0a0d0411"
			},
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		store.dispatch(new AddCaseSuccessAction(caseItem));

		effectsRunner.queue(new SelectCaseAction(caseItem.id));

		casesAppEffects.selectCase$.subscribe((result: LoadOverlaysAction) => {
			expect(result instanceof LoadOverlaysAction).toBeTruthy();
			expect(result.payload.to).toEqual(caseItem.state.time.to);
			expect(result.payload.from).toEqual(caseItem.state.time.from);
			expect(result.payload.polygon).toEqual(caseItem.state.region)
			expect(result.payload.caseId).toEqual(caseItem.id)
		});

	});
/*

	it('On selectCase$ call to loadOverlaysAction with no params and recieve nothing ', () => {

		effectsRunner.queue(new SelectCaseAction('tmp'));
		let result: any;

		casesAppEffects.selectCase$.subscribe((_result: LoadOverlaysAction) => {
			result = _result;
		});

		expect(result).toBeFalsy();


	});
*/


});
