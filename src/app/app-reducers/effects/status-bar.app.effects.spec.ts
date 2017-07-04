import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { ChangeLayoutAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import {
	AddCaseSuccessAction, SelectCaseByIdAction, UpdateCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { ConnectionBackend, Http, HttpModule } from '@angular/http';
import { configuration } from "configuration/configuration";
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { statusBarFlagsItems } from '@ansyn/status-bar/reducers/status-bar.reducer';
import {
	DisableMouseShadow, EnableMouseShadow,
	StopMouseShadow
} from '@ansyn/menu-items/tools/actions/tools.actions';
import {
	BackToWorldViewAction, ExpandAction, FavoriteAction, GoNextAction,
	GoPrevAction
} from '../../packages/status-bar/actions/status-bar.actions';
import { BackToWorldAction } from '../../packages/map-facade/actions/map.actions';

describe('StatusBarAppEffects', () => {
	let statusBarAppEffects: StatusBarAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer})
			],
			providers: [
				StatusBarAppEffects,
				{provide: CasesService, useValue: {updateCase: () => null}},
				ImageryCommunicatorService,
				OverlaysService,
				Http,
				ConnectionBackend,
				{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig }
			]
		}).compileComponents();
	}));


	beforeEach(inject([ImageryCommunicatorService,StatusBarAppEffects, EffectsRunner, Store, CasesService], (_imageryCommunicatorService,_statusBarAppEffects: StatusBarAppEffects, _effectsRunner: EffectsRunner, _store: Store<any>, _casesService: CasesService) => {
		statusBarAppEffects = _statusBarAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
		casesService = _casesService;
		imageryCommunicatorService = _imageryCommunicatorService;

		const fakeCase: Case = {
			id: 'case1',
			state: {
				region: {
					type: 'Polygon',
					coordinates: [
						[
							[-64.73, 32.31],
							[-80.19, 25.76],
							[-66.09, 18.43],
							[-64.73, 32.31]
						]
					]
				},
            }
		} as any;

		store.dispatch(new AddCaseSuccessAction(fakeCase));
		store.dispatch(new SelectCaseByIdAction(fakeCase.id));
	}));



	it('updatePinPointSearchAction$',() => {
		const action  = new UpdateStatusFlagsAction({key: statusBarFlagsItems.pinPointSearch,value: true });

		//mock communicatorsAsArray
		const imagery1 = {
			createMapSingleClickEvent: () => {}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1,imagery1]);
		spyOn (imagery1,'createMapSingleClickEvent');

		effectsRunner.queue(action);

		statusBarAppEffects.updatePinPointSearchAction$.subscribe( () => {
			expect(imagery1.createMapSingleClickEvent['calls'].count()).toBe(2);
		})

	});

	it("updatePinPointIndicatorAction$ - add",() => {

		const action  = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator,value: true });
		store.dispatch(action);
		//mock communicatorsAsArray
		const imagery1 = {
			addPinPointIndicator: () => {},
			removePinPointIndicator: () => {}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1,imagery1,imagery1]);
		spyOn (imagery1,'addPinPointIndicator');
		spyOn (imagery1,'removePinPointIndicator');

		effectsRunner.queue(action);

		statusBarAppEffects.updatePinPointIndicatorAction$.subscribe( () => {
			expect(imagery1.addPinPointIndicator['calls'].count()).toBe(3);
		})
	})

	it("updatePinPointIndicatorAction$ - remove",() => {

		const action  = new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointIndicator,value: false });
		store.dispatch(action);
		//mock communicatorsAsArray
		const imagery1 = {
			addPinPointIndicator: () => {},
			removePinPointIndicator: () => {}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1,imagery1,imagery1]);
		spyOn (imagery1,'addPinPointIndicator');
		spyOn (imagery1,'removePinPointIndicator');

		effectsRunner.queue(action);

		statusBarAppEffects.updatePinPointIndicatorAction$.subscribe( () => {
			expect(imagery1.removePinPointIndicator['calls'].count()).toBe(3);
		})
	})

	it('onLayoutsChange$ should; set new layout_index on selected_case, change the maps of selected_case if layouts map_count are not equal', () => {
		spyOn(casesService, 'updateCase').and.callFake((s_case) => Observable.of(s_case));
		spyOn(statusBarAppEffects, 'setMapsDataChanges').and.callFake((s_case) => s_case);

		const new_layout_index = 1;
		const layouts_index = 2;

		const caseItem: Case = <any> {
			id: "31b33526-6447-495f-8b52-83be3f6b55bd",
			state:{
				maps:{
					layouts_index,
					data : [{},{}]
				}
			}
		};
		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		let action: ChangeLayoutAction = new ChangeLayoutAction(new_layout_index);
		effectsRunner.queue(action);

		statusBarAppEffects.onLayoutsChange$.subscribe((_result: UpdateCaseAction | UpdateMapSizeAction)=>{
			expect((_result instanceof UpdateCaseAction) || (_result instanceof UpdateMapSizeAction) || (_result instanceof DisableMouseShadow) || (_result instanceof StopMouseShadow) || (_result instanceof EnableMouseShadow)  ).toBeTruthy();

			if ( _result instanceof UpdateCaseAction) {
				expect(_result.payload.state.maps.layouts_index).toEqual(new_layout_index);
			}
		});
	});

	it('selectCase$ should get layers_index from selected_case and return ChangeLayoutAction with result', () => {
		const layouts_index = 2;
		const caseItem: Case = <any> {
			id: "31b33526-6447-495f-8b52-83be3f6b55bd",
			state:{
				maps:{
					layouts_index
				}
			}
		};

		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));
		statusBarAppEffects.selectCase$.subscribe((result: ChangeLayoutAction)=>{
			expect(result instanceof ChangeLayoutAction).toBeTruthy();
			expect(result.payload).toEqual(layouts_index);
		});
	});

	it('onBackToWorldView$$ should return BackToWorldAction with no args', () => {
		effectsRunner.queue(new BackToWorldViewAction());
		statusBarAppEffects.onBackToWorldView$.subscribe((result: ChangeLayoutAction)=>{
			expect(result instanceof BackToWorldAction).toBeTruthy();
		});
	});

	it('onGoNext$', () => {
		effectsRunner.queue(new GoNextAction());
		statusBarAppEffects.onGoNext$.subscribe(() => {
			console.log("onGoNext$")
		});
	});

	it('onGoPrev$', () => {
		effectsRunner.queue(new GoPrevAction());
		statusBarAppEffects.onGoPrev$.subscribe(() => {
			console.log("onGoPrev$")
		});
	});

	it('onExpand$', () => {
		effectsRunner.queue(new ExpandAction());
		statusBarAppEffects.onExpand$.subscribe(() => {
			console.log("onExpand$")
		});
	});

	it('onFavorite$', () => {
		effectsRunner.queue(new FavoriteAction());
		statusBarAppEffects.onFavorite$.subscribe(() => {
			console.log("onFavorite$")
		});
	});

});
