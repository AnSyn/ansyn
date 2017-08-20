import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { StatusBarAppEffects } from './status-bar.app.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { ChangeLayoutAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { StatusBarReducer } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/menu-items/cases/models/case.model';
import { AddCaseSuccessAction, SelectCaseByIdAction, UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Observable } from 'rxjs/Observable';
import { UpdateMapSizeAction } from '@ansyn/map-facade/actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { ConnectionBackend, Http, HttpModule } from '@angular/http';
import { configuration } from "configuration/configuration";
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { statusBarFlagsItems } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { DisableMouseShadow, EnableMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools/actions/tools.actions';
import { BackToWorldViewAction, ExpandAction, FavoriteAction, GoNextAction, GoPrevAction } from '@ansyn/status-bar';
import { BackToWorldAction } from '@ansyn/map-facade';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { GoNextDisplayAction, GoPrevDisplayAction } from '@ansyn/overlays/actions/overlays.actions';
import {BaseOverlaySourceProvider, IFetchParams,Overlay} from '@ansyn/overlays';
import { SetGeoFilterAction, SetOrientationAction, SetTimeAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { cloneDeep } from 'lodash';

class OverlaySourceProviderMock extends BaseOverlaySourceProvider{
	sourceType = "Mock";
	public fetch(fetchParams: IFetchParams): Observable<Overlay[]> {
		return Observable.empty();
	}

}

describe('StatusBarAppEffects', () => {
	let statusBarAppEffects: StatusBarAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let overlaysService: OverlaysService;
	let fakeCase: Case;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({status_bar: StatusBarReducer, cases: CasesReducer, overlays: OverlayReducer})
			],
			providers: [
				OverlaysService,
				StatusBarAppEffects,
				{provide: CasesService, useValue: {updateCase: () => null, getOverlaysMarkup: () => null }},
				ImageryCommunicatorService,
				OverlaysService,
				Http,
				ConnectionBackend,
				{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig },
				{ provide: BaseOverlaySourceProvider, useClass :OverlaySourceProviderMock}
			]
		}).compileComponents();
	}));


	beforeEach(inject([ImageryCommunicatorService,StatusBarAppEffects, EffectsRunner, Store, CasesService, OverlaysService], (_imageryCommunicatorService,_statusBarAppEffects: StatusBarAppEffects, _effectsRunner: EffectsRunner, _store: Store<any>, _casesService: CasesService, _overlaysService: OverlaysService) => {
		statusBarAppEffects = _statusBarAppEffects;
		effectsRunner = _effectsRunner;
		store = _store;
		casesService = _casesService;
		imageryCommunicatorService = _imageryCommunicatorService;
		overlaysService = _overlaysService;

			fakeCase = {
			id: 'case1',
			state: {
				facets:{},
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
				maps: {
					active_map_id: "active_map_id",
					data: [
						{
							id: 'active_map_id',
							data: {overlay: {id :'overlayId1'}}
						}
					]
				},
				favoritesOverlays: []
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

	it('selectCase$ should get layers_index, orientation, geoFilter and time from selected_case and return all update status-bar actions', () => {
		const layouts_index = 2;
		const caseItem: Case = <any> {
			id: "31b33526-6447-495f-8b52-83be3f6b55bd",
			state:{
				maps:{
					layouts_index
				},
				orientation: 'orientation',
				geoFilter: 'geoFilter',
				time: {from: 0, to: 100}
			}
		};

		store.dispatch(new AddCaseSuccessAction(caseItem));
		store.dispatch(new SelectCaseByIdAction(caseItem.id));

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));
		statusBarAppEffects.selectCase$.subscribe((result: ChangeLayoutAction | SetOrientationAction | SetGeoFilterAction | SetTimeAction)=>{
			switch (result.constructor) {
				case ChangeLayoutAction:
					expect(result.payload).toEqual(layouts_index);
					break;
				case SetOrientationAction:
					expect(result.payload).toEqual('orientation');
					break;
				case SetGeoFilterAction:
					expect(result.payload).toEqual('geoFilter');
					break;
				case SetTimeAction:
					expect(result.payload).toEqual({from: new Date(0), to: new Date(100)});
					break;
			}
		});
	});

	it('onBackToWorldView$$ should return BackToWorldAction with no args', () => {
		effectsRunner.queue(new BackToWorldViewAction());
		statusBarAppEffects.onBackToWorldView$.subscribe((result: BackToWorldAction)=>{
			expect(result instanceof BackToWorldAction).toBeTruthy();
		});
	});

	describe('onGoPrevNext$', () => {
		it('should return onGoNextDisplayAction (type of action is GoNextAction) with current overlayId ', () => {
			effectsRunner.queue(new GoNextAction()); // current overlay overlayId1
			statusBarAppEffects.onGoPrevNext$.subscribe((result: GoNextDisplayAction) => {
				expect(result instanceof GoNextDisplayAction).toBeTruthy();
				expect(result.payload).toEqual('overlayId1');
			}).unsubscribe();
		});
		it('should return onGoPrevDisplayAction (type of action is GoPrevAction) with current overlayId', () => {
			effectsRunner.queue(new GoPrevAction()); // current overlay overlayId1
			statusBarAppEffects.onGoPrevNext$.subscribe((result: GoPrevDisplayAction) => {
				expect(result instanceof GoPrevDisplayAction).toBeTruthy();
				expect(result.payload).toEqual('overlayId1');
			}).unsubscribe();
		});
	});
	// it('should set new timelineState when date is bigger then "timelineState.to" ', () => {
	//
	// 	const timelineState = {
	// 		to: new Date(1000), /* 1000 < 2000 */
	// 		from: new Date(0)
	// 	};
	// 	overlaysService.sortedDropsIds = [{id: "firstOverlayId"}, {id: "overlayId"}, {id: "overlayId1", date: new Date(2000)}, {id: "overlayId2"}];
	// 	store.dispatch(new SetTimelineStateAction(timelineState));
	// 	effectsRunner.queue(new GoNextAction());
	// 	statusBarAppEffects.onGoNext$.subscribe((result: DisplayOverlayAction) => {
	// 		expect((result instanceof DisplayOverlayAction) || (result instanceof SetTimelineStateAction)).toBeTruthy();
	// 		if(result instanceof DisplayOverlayAction) {
	// 			expect(result.payload.id).toEqual("overlayId1");
	// 			expect(result.payload.map_id).toEqual("active_map_id");
	// 		}
	//
	// 		if(result instanceof SetTimelineStateAction) {
	// 			const delta = timelineState.to.getTime() - timelineState.from.getTime();
	// 			const deltaTenth: number = delta *0.1;
	// 			expect(result.payload.to).toEqual(new Date(2000 + deltaTenth));
	// 		}
	// 	});
	// });

	it('onExpand$', () => {
		effectsRunner.queue(new ExpandAction());
		statusBarAppEffects.onExpand$.subscribe(() => {
			console.log("onExpand$");
		});
	});

	it('onFavorite$ with favorites and showOnlyFavorites off', () => {
		effectsRunner.queue(new FavoriteAction());
		let counter = 0;
		statusBarAppEffects.onFavorite$.subscribe((result) => {
			counter++;
			if (result instanceof  UpdateCaseAction){
				expect(result.payload.state.favoritesOverlays[0]).toBe("overlayId1");
			}

		});
		expect(counter).toBe(3);
	});

	it('onFavorite$ with favorites and showOnlyFavorites on (unfavorite)',() => {
		const testCase = cloneDeep(fakeCase);
		testCase.state.facets.showOnlyFavorites = true;
		testCase.state.favoritesOverlays.push("overlayId1");
		store.dispatch(new UpdateCaseAction( testCase));
		effectsRunner.queue(new FavoriteAction());
		let count =0;
		statusBarAppEffects.onFavorite$.subscribe((result) => {
			count++;
			if (result instanceof UpdateCaseAction){
				expect(count).toBe(1);
				expect(result.payload.state.favoritesOverlays.length).toBe(0);
			}

		});
		expect(count).toBe(4);
	});
});
