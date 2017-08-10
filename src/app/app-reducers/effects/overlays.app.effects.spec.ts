import { inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import { LoadOverlaysSuccessAction, OverlaysActionTypes, LoadOverlaysAction,
	DisplayOverlayAction, DisplayOverlayFromStoreAction, SetFiltersAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesReducer, Case, CasesService, AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { HttpModule } from '@angular/http';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { OverlaySourceProviderMock } from '@ansyn/overlays/services/overlays.service.spec';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { Observable } from 'rxjs/Observable';

describe('OverlaysAppEffects',()=> {
	let overlaysAppEffects: OverlaysAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;

	let cases: any = {
		selected_case : {tmp:'1'}
	};

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
			}
		}
	} as any;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				HttpModule,

				StoreModule.provideStore({ cases: CasesReducer, overlays: OverlayReducer}),

			],
			providers:[
				OverlaysAppEffects,
				OverlaysService,
				{ provide: BaseOverlaySourceProvider, useClass :OverlaySourceProviderMock},
				{ provide: OverlaysConfig, useValue: {} },
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null,
						contextValues: {imageryCount: -1}
					}
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store],(_store) => {
		store = _store;
		spyOn(store, 'select').and.callFake((type) => {
			console.log(type,'x');
			if(type === 'overlays') {
				return Observable.of({
					filteredOverlays: ['first', 'last']
				});
			}
			if(type === 'cases'){
				return Observable.of({
					selected_case: caseItem,
					cases: [ caseItem ]
				});
			}
			return Observable.empty();
		});
	}));

	beforeEach(inject([ CasesService, EffectsRunner, OverlaysAppEffects, OverlaysService],( _casesService:CasesService,_effectsRunner:EffectsRunner,_overalysAppEffects:OverlaysAppEffects, _overlaysService: OverlaysService) => {
		casesService = _casesService;
		overlaysAppEffects = _overalysAppEffects;
		effectsRunner = _effectsRunner;
		overlaysService = _overlaysService;
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

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));

		overlaysAppEffects.selectCase$.subscribe((result: LoadOverlaysAction) => {
			expect(result instanceof LoadOverlaysAction).toBeTruthy();
			expect(result.payload.to).toEqual(caseItem.state.time.to);
			expect(result.payload.from).toEqual(caseItem.state.time.from);
			expect(result.payload.polygon).toEqual(caseItem.state.region);
			expect(result.payload.caseId).toEqual(caseItem.id);
		});
	});

	it('displayLatestOverlay$ effect should have been call only if displayOverlay = "latest"', () => {
		let result;
		const drops = [{name:'name', data: [{id: 'first'}, {id: 'last'}]}];



		casesService.contextValues.defaultOverlay = 'latest';

		effectsRunner.queue(new SetFiltersAction([]));

		overlaysAppEffects.displayLatestOverlay$.subscribe((_result) => {
			result = _result;
		});

		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
		expect(result.payload.id).toEqual('last');
	});
});
