import { inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import { Observable } from 'rxjs/Observable';
import { LoadOverlaysSuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { CasesReducer, Case, CasesService, AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { LoadOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';

describe('OverlaysAppEffects',()=> {
	let overlaysAppEffects: OverlaysAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let cases: any = {
		selected_case : {tmp:'1'}
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer}),

			],
			providers:[
				OverlaysAppEffects,
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null
					}
				}
			]

		}).compileComponents();
	});


	beforeEach(inject([Store,CasesService,EffectsRunner,OverlaysAppEffects],(_store: Store<any>,_casesService:CasesService,_effectsRunner:EffectsRunner,_overalysAppEffects:OverlaysAppEffects) => {
		store = _store;
		casesService = _casesService;
		overlaysAppEffects = _overalysAppEffects;
		effectsRunner = _effectsRunner;
		spyOn(store,'select').and.callFake( type => {
			switch(type){
				case "cases":
					return Observable.of({
						selected_case : {someFakeData:'tmp'}
					});
				default:
					return Observable.empty();
			}

		});

	}))

	beforeEach(inject([Store,CasesService,EffectsRunner,OverlaysAppEffects],(_store: Store<any>,_casesService:CasesService,_effectsRunner:EffectsRunner,_overalysAppEffects:OverlaysAppEffects) => {
		casesService = _casesService;
		overlaysAppEffects = _overalysAppEffects;
		effectsRunner = _effectsRunner;

	}));

	it('should be defined', () => {
		expect(overlaysAppEffects).toBeTruthy();
	});

	it("onOverlaysMarkupsChanged$",() => {
		spyOn(casesService,'getOverlaysMarkup').and.returnValue({});
		const action = new LoadOverlaysSuccessAction({} as any);
		effectsRunner.queue(action);
		let count = 0;
		overlaysAppEffects.onOverlaysMarkupsChanged$.subscribe((_result:Action) => {
			count++;
			expect(_result.type).toEqual(OverlaysActionTypes.OVERLAYS_MARKUPS);
			expect(casesService.getOverlaysMarkup).toHaveBeenCalledTimes(1);
		});
		expect(count).toBe(1);
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

		overlaysAppEffects.selectCase$.subscribe((result: LoadOverlaysAction) => {
			expect(result instanceof LoadOverlaysAction).toBeTruthy();
			expect(result.payload.to).toEqual(caseItem.state.time.to);
			expect(result.payload.from).toEqual(caseItem.state.time.from);
			expect(result.payload.polygon).toEqual(caseItem.state.region);
			expect(result.payload.caseId).toEqual(caseItem.id);
		});
	});

});
