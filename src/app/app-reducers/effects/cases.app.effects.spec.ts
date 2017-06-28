import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { CasesService, casesConfig } from '@ansyn/menu-items/cases';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { SelectCaseByIdAction, SaveDefaultCaseAction, AddCaseAction } from '@ansyn/menu-items/cases';
import { HttpModule } from '@angular/http';
import { CasesReducer,AddCaseSuccessAction } from '@ansyn/menu-items/cases';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlayReducer, LoadOverlaysAction } from '@ansyn/overlays';
import { ICasesState } from '@ansyn//menu-items/cases';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import {
	DisplayOverlayAction, LoadOverlaysSuccessAction,
	OverlaysActionTypes
} from '../../packages/overlays/actions/overlays.actions';
import { CasesActionTypes } from '../../packages/menu-items/cases/actions/cases.actions';

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
				CoreModule,
				RouterTestingModule
			],
			providers: [CasesAppEffects,
				CasesService,
				{ provide: casesConfig, useValue: { casesBaseUrl: null }}]

		}).compileComponents();
	}));

	beforeEach(inject([Store, casesConfig], (_store: Store<any>, casesConfig:any) => {
		store = _store;

		icase_state = {
			cases: [{
				id: 'case1',
				state:{
					maps: {
						active_map_id: '5555',
						data:[
							{
								id: '5555',
								data: {}

							},
							{
								id: '4444',
								data: {}
							}
						]
					}
				}
			}],
			selected_case:{
				id: 'case1',
				index: 0

			},
			default_case: {
				id: 'case1',
				state: {
					selected_overlays_ids: []
				}
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(icase_state.cases[0]));
		store.dispatch(new SelectCaseByIdAction(icase_state.selected_case.id));
		store.dispatch( new LoadOverlaysSuccessAction([{id: 'tmp',name:'tmp',imageUrl:'tmp',sourceType:"tmp"}] as any));
	}));

	beforeEach(inject([CasesAppEffects, EffectsRunner, CasesService], (_casesAppEffects: CasesAppEffects, _effectsRunner: EffectsRunner, _casesService: CasesService) => {
		casesAppEffects = _casesAppEffects;
		effectsRunner = _effectsRunner;
		casesService = _casesService;
	}));

	it('Effect : onDisplayOverlay$ - with the active map id ' ,() => {
		const action  = new DisplayOverlayAction({ id: "tmp"});

		effectsRunner.queue(action)
		let count = 0;
		casesAppEffects.onDisplayOverlay$.subscribe((_result:Action)=>{
			if(_result.type == CasesActionTypes.UPDATE_CASE){
				expect(_result.payload.state.maps.data[0].data.selectedOverlay.name).toBe('tmp');
				expect(_result.payload.state.maps.data[0].id).toBe(icase_state.cases[0].state.maps.active_map_id);
				count++;
			}
			if(_result.type == OverlaysActionTypes.OVERLAYS_MARKUPS){
				expect(_result.payload[0].id == 'tmp');
				expect(_result.payload[0].class == 'active');
				count++
			}

		});
		expect(count).toBe(2);
	});

	it('Effect : onDisplayOverlay$ - with the active map id ' ,() => {
		const action  = new DisplayOverlayAction({ id: "tmp",map_id: '4444'});

		effectsRunner.queue(action)
		let count = 0;
		casesAppEffects.onDisplayOverlay$.subscribe((_result:Action)=>{
			if(_result.type == CasesActionTypes.UPDATE_CASE){
				expect(_result.payload.state.maps.data[1].data.selectedOverlay.name).toBe('tmp');
				expect(_result.payload.state.maps.data[1].id).not.toBe(icase_state.cases[0].state.maps.active_map_id);
				count++;
			}
			if(_result.type == OverlaysActionTypes.OVERLAYS_MARKUPS){
				expect(_result.payload[0].id == 'tmp');
				expect(_result.payload[0].class == 'displayed');
				count++
			}

		});
		expect(count).toBe(2);
	});



	it('On selectCase$ call to loadOverlaysAction with case params ', () => {

		const caseItem: Case =  {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd",
			"state": {
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
			}
		} as any;

		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));

		casesAppEffects.selectCase$.subscribe((result: LoadOverlaysAction) => {
			expect(result instanceof LoadOverlaysAction).toBeTruthy();
			expect(result.payload.to).toEqual(caseItem.state.time.to);
			expect(result.payload.from).toEqual(caseItem.state.time.from);
			expect(result.payload.polygon).toEqual(caseItem.state.region);
			expect(result.payload.caseId).toEqual(caseItem.id);
		});

	});


	it('saveDefaultCase$ should add a default case', () => {
		effectsRunner.queue(new SaveDefaultCaseAction(icase_state.default_case));

		casesAppEffects.saveDefaultCase$.subscribe((result: AddCaseAction) => {
			expect(result instanceof AddCaseAction).toBeTruthy();
			expect(result.payload).toEqual(icase_state.default_case);
		});
	});

});
