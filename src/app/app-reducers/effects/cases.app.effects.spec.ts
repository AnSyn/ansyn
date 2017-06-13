import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { SelectOverlayAction, UnSelectOverlayAction } from '@ansyn/overlays';
import { CasesService, casesConfig } from '@ansyn/menu-items/cases';
import { Observable } from 'rxjs/Observable';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { UpdateCaseAction, UpdateCaseSuccessAction, SelectCaseByIdAction, LoadDefaultCaseSuccessAction, SaveDefaultCaseAction, AddCaseAction } from '@ansyn/menu-items/cases';
import { HttpModule } from '@angular/http';
import { CasesReducer,AddCaseSuccessAction } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { OverlayReducer, LoadOverlaysAction } from '@ansyn/overlays';
import { ICasesState } from '@ansyn//menu-items/cases';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

class MockRouter {
    navigate(url: string) { return url; }
}

describe('CasesAppEffects', () => {
	let casesAppEffects: CasesAppEffects;
	let effectsRunner: EffectsRunner;
	let casesService: CasesService;
	let store: Store < any > ;
	let icase_state: ICasesState;
	let router: Router;

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
				{ provide: casesConfig, useValue: { casesBaseUrl: null } },
				{ provide: Router, useClass: MockRouter }]

		}).compileComponents();
	}));

	beforeEach(inject([Store, casesConfig, Router], (_store: Store<any>, casesConfig:any, _router: Router) => {
		store = _store;
		router =_router;

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
	}));

	beforeEach(inject([CasesAppEffects, EffectsRunner, CasesService], (_casesAppEffects: CasesAppEffects, _effectsRunner: EffectsRunner, _casesService: CasesService) => {
		casesAppEffects = _casesAppEffects;
		effectsRunner = _effectsRunner;
		casesService = _casesService;
	}));

	// it('selectOverlay$ should push overlay.id to selected_overlays_ids on cases', () => {
	// 	let selected_case: Case = icase_state.cases[0];
    //
	// 	spyOn(casesService, 'updateCase').and.callFake(() => Observable.of(selected_case));
    //
	// 	effectsRunner.queue(new SelectOverlayAction("1234-5678"));
	// 	let result: UpdateCaseAction;
	// 	casesAppEffects.onDisplayOverlay$.subscribe((_result: UpdateCaseSuccessAction) => {
	// 		result = _result;
	// 	});
    //
	// 	expect(result instanceof UpdateCaseAction).toBeTruthy();
	// 	expect(result.payload).toEqual(selected_case);
	// 	expect(selected_case.state.selected_overlays_ids).toEqual(["1234-5678"]);
	// });

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

	it('selectCaseUpdateRouter$ route to the (non-default) case being selected', () => {
		const caseItem: Case =  {
			"id": "31b33526-6447-495f-8b52-83be3f6b55bd"
		} as any;

		spyOn(router, 'navigate');

		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));

		casesAppEffects.selectCaseUpdateRouter$.subscribe(() => {
			expect(router.navigate).toHaveBeenCalledWith(['', caseItem.id]);
		});
	});

	it('selectCaseUpdateRouter$ route to the (default) case being selected', () => {
		spyOn(router, 'navigate');

		store.dispatch(new LoadDefaultCaseSuccessAction(icase_state.default_case));
		store.dispatch(new SelectCaseByIdAction(icase_state.default_case.id));

		effectsRunner.queue(new SelectCaseByIdAction(icase_state.default_case.id));

		casesAppEffects.selectCaseUpdateRouter$.subscribe(() => {
			expect(router.navigate).toHaveBeenCalledWith(['', '']);
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
