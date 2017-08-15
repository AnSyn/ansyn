import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { CasesAppEffects } from './cases.app.effects';
import { CasesService, casesConfig } from '@ansyn/menu-items/cases';
import { SelectCaseByIdAction, SaveDefaultCaseAction, AddCaseAction } from '@ansyn/menu-items/cases';
import { HttpModule } from '@angular/http';
import { CasesReducer,AddCaseSuccessAction } from '@ansyn/menu-items/cases';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlayReducer} from '@ansyn/overlays';
import { ICasesState } from '@ansyn//menu-items/cases';
import { CoreModule } from '@ansyn/core';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadOverlaysSuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ShowOverlaysFootprintAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { ContextProviderService } from '@ansyn/context/providers/context-provider.service';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { DisplayOverlayAction } from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';

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
				{ provide: casesConfig, useValue: { casesBaseUrl: null }},
				ContextProviderService
			]

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

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Hitmap"' ,() => {
		effectsRunner.queue(new ShowOverlaysFootprintAction('Hitmap'));
		let count = 0;
		casesAppEffects.updateCaseFromTools$.subscribe((_result:Action)=>{
			if(_result.type === CasesActionTypes.UPDATE_CASE){
				expect(_result.payload.state.maps.data[0].data.overlayDisplayMode).toBe('Hitmap');
				count++;
			}
		});
		expect(count).toBe(1);
	});

	it('Effect : onDisplayOverlay$ - with the active map id ' ,() => {
		const action  = new DisplayOverlayAction({overlay: <Overlay> {id: 'tmp'}});
		effectsRunner.queue(action);
		let result: UpdateCaseAction;
		casesAppEffects.onDisplayOverlay$.subscribe((_result: UpdateCaseAction) => {result = _result;});
		expect(result.constructor).toEqual(UpdateCaseAction);
		expect(CasesService.activeMap(result.payload).data.overlay.id).toEqual('tmp');
	});

	it('saveDefaultCase$ should add a default case', () => {
		effectsRunner.queue(new SaveDefaultCaseAction(icase_state.default_case));

		casesAppEffects.saveDefaultCase$.subscribe((result: AddCaseAction) => {
			expect(result instanceof AddCaseAction).toBeTruthy();
			expect(result.payload).toEqual(icase_state.default_case);
		});
	});

});
