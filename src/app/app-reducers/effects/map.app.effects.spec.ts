import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerTreeNodeLeaf } from '@ansyn/menu-items/layers-manager/models/layer-tree-node-leaf';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ICasesState, CasesReducer, UpdateCaseAction, CasesService } from '@ansyn/menu-items/cases';
import { Action, Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { ImageryCommunicatorService, ConfigurationToken } from "@ansyn/imagery";
import { Observable } from 'rxjs/Observable';
import {  StopMapShadowAction, StartMapShadowAction, CompositeMapShadowAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { configuration } from "configuration/configuration";
import { TypeContainerService,TypeContainerModule } from '@ansyn/type-container';
import { BaseSourceProvider } from '@ansyn/imagery';
import { cloneDeep } from 'lodash';
import { StartMouseShadow, StopMouseShadow } from '@ansyn/menu-items/tools';
import { AddMapInstacneAction, MapSingleClickAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import {
	statusBarFlagsItems, StatusBarInitialState,
	StatusBarReducer
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { LoadOverlaysAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { DisplayOverlayAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { OverlayReducer } from '@ansyn/overlays/reducers/overlays.reducer';
import { IAppState } from '../app-reducers.module';
import { IOverlayState, overlayInitialState } from '../../packages/overlays/reducers/overlays.reducer';
import { IStatusBarState } from '../../packages/status-bar/reducers/status-bar.reducer';
import { Case } from '../../packages/menu-items/cases/models/case.model';




class SourceProviderMock1 implements BaseSourceProvider {
	mapType= 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}
}

describe('MapAppEffects', () => {
	let mapAppEffects: MapAppEffects;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	let icaseState: ICasesState;
	let statusBarState: IStatusBarState;
	let overlaysState: IOverlayState;
	let casesService:CasesService;
	let imageryCommunicatorServiceMock = {
		provide:() => {},
		communicatorsAsArray:() => {}
	};

	const cases: Case[] = [{
		state: {
			time: { type: "",from: new Date(), to: new Date()},
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
				data: [
					{id: 'imagery1'},
					{id: 'imagery2'},
					{id: 'imagery3'}
				]
			}
		} as any
	}];

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer,status_bar: StatusBarReducer ,overlays: OverlayReducer }),
				TypeContainerModule.register({
					baseType : BaseSourceProvider,
					type: SourceProviderMock1,
					name : ['mapType1','sourceType1'].join(",")
				})],
			providers: [
				MapAppEffects,
				TypeContainerService,
				OverlaysService,
				{ provide: OverlaysConfig, useValue: configuration.OverlaysConfig },
				{ provide: ConfigurationToken, useValue: configuration.ImageryConfig },
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				},
				{
					provide: CasesService,
					useValue: {
						updateCase: () => null,
						wrapUpdateCase: () => null,
						getOverlaysMarkup: () => null
					}
				}
			]

		}).compileComponents();
	}));

	/* store data mock */
	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selected_case = cases[0];
		icaseState = {cases, selected_case} as any;
		statusBarState = cloneDeep(StatusBarInitialState);
		overlaysState = cloneDeep(overlayInitialState);
		const fakeStore = {cases: icaseState, status_bar: statusBarState, overlays: overlaysState};

		spyOn(store, 'select').and.callFake(type => {
			return Observable.of(fakeStore[type]);
		});
	}));

	beforeEach(inject([MapAppEffects, EffectsRunner, ImageryCommunicatorService, CasesService], (_mapAppEffects: MapAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService, _casesService: CasesService) => {
		mapAppEffects = _mapAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
		casesService = _casesService;
	}));

	it('should be defined', () => {
		expect(mapAppEffects).toBeTruthy();
	});

	it('onMapSingleClick$ effect',() => {
		statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
		statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
		//mock communicatorsAsArray
		const imagery1 = {
			addPinPointIndicator: () => {},
			removeSingleClickEvent: () => {}
		};
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [imagery1,imagery1,imagery1]);
		spyOn (imagery1,'addPinPointIndicator');
		spyOn (imagery1,'removeSingleClickEvent');

		const action = new MapSingleClickAction({
			lonLat: [ -70.33666666666667, 25.5 ]
		});

		effectsRunner.queue(action);
		mapAppEffects.onMapSingleClick$.concat().subscribe( (_result:Action) => {
			let result = _result instanceof UpdateStatusFlagsAction || _result instanceof UpdateCaseAction || _result instanceof LoadOverlaysAction;
			expect(result).toBe(true);
			if(_result instanceof UpdateStatusFlagsAction ){
				expect(_result.payload.key).toEqual(statusBarFlagsItems.pinPointSearch);
				expect(_result.payload.value).toEqual(false);
			}
			if(_result instanceof UpdateCaseAction ){
				expect(_result.payload.state.region).not.toEqual(icaseState.selected_case.state.region);
				icaseState.selected_case = _result.payload;
			}
			if(_result instanceof LoadOverlaysAction){
				expect (_result.payload).toEqual({
					to: icaseState.selected_case.state.time.to,
					from: icaseState.selected_case.state.time.from,
					polygon:icaseState.selected_case.state.region,
					caseId: icaseState.selected_case.id
				})
			}
		});

		expect(imagery1.addPinPointIndicator['calls'].count()).toBe(3)
		expect(imagery1.removeSingleClickEvent['calls'].count()).toBe(3)
	});

	it('addVectorLayer$ should add the selected Layer to the map', () => {
		const staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: "fake_url",
			isIndeterminate: false,
			children: []
		};

		const action: SelectLayerAction = new SelectLayerAction(staticLeaf);
		const imagery1 = {
			addVectorLayer: () => {

			}
		};
		effectsRunner.queue(action);
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'addVectorLayer');

		mapAppEffects.addVectorLayer$.subscribe(() => {
			expect(imagery1.addVectorLayer).toHaveBeenCalledWith(staticLeaf);
		});
	});

	it('removeVectorLayer$ should remove the unselected Layer to the map', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: "fake_url",
			isIndeterminate: false,
			children: []
		};

		let action: UnselectLayerAction = new UnselectLayerAction(staticLeaf);
		let imagery1 = {
			removeVectorLayer: () => {

			}
		};
		effectsRunner.queue(action);
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => imagery1);
		spyOn(imagery1, 'removeVectorLayer');

		mapAppEffects.removeVectorLayer$.subscribe(() => {
			expect(imagery1.removeVectorLayer).toHaveBeenCalledWith(staticLeaf);
		});
	});

	describe('onCommunicatorChange$', () => {
		it('on communicator changes return action composite map shadow', () => {
			const communicators: Array<string> = ['imagery1'];

			communicators.push('imagery2');
			const expectedResult = new CompositeMapShadowAction();

			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery2',
				communicatorsIds: communicators
			}));

			communicators.push('imagery3');
			effectsRunner.queue(new AddMapInstacneAction({
				currentCommunicatorId: 'imagery3',
				communicatorsIds: communicators
			}));

			let result = null;

			mapAppEffects.onCommunicatorChange$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(expectedResult);
		});
	});

	describe('onAddCommunicatorShowPinPoint$', () => {
		it('on add communicator show pinpoint', () => {
			statusBarState.flags.set(statusBarFlagsItems.pinPointSearch, true);
			statusBarState.flags.set(statusBarFlagsItems.pinPointIndicator, true);
			const communicator = {
				addPinPointIndicator: () => {
				},
				createMapSingleClickEvent: () => {
				}
			};
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'addPinPointIndicator');
			spyOn(communicator, 'createMapSingleClickEvent');
			const action = new AddMapInstacneAction({
				communicatorsIds: ['tmpId1', 'tmpId2'],
				currentCommunicatorId: 'tmpId2'
			});
			effectsRunner.queue(action);
			mapAppEffects.onAddCommunicatorShowPinPoint$.subscribe();
			expect(communicator.addPinPointIndicator).toHaveBeenCalled();
			expect(communicator.createMapSingleClickEvent).toHaveBeenCalled();
		});
	});

	describe('onActiveMapChanges$', () => {

		it('on active map changes fire update case action', () => {
			spyOn(casesService, 'getOverlaysMarkup');
			effectsRunner.queue(new ActiveMapChangedAction('imagery2'));
			let count = 0;
			mapAppEffects.onActiveMapChanges$.subscribe((_result: Action) => {
				//expect(true).toBe(false);
				count++;
				if (_result.type == CasesActionTypes.UPDATE_CASE) {
					expect(_result.payload.state.maps.active_map_id).toBe('imagery2');
				}
				if (_result.type == OverlaysActionTypes.OVERLAYS_MARKUPS) {
					expect(casesService.getOverlaysMarkup).toHaveBeenCalled();
				}

			});
			expect(count).toBe(2);
		});
	});

	describe('onStartMapShadow$', () => {
		it('listen to start map shadow action',() => {
			effectsRunner.queue(new StartMouseShadow());
			let result = null;
			mapAppEffects.onStartMapShadow$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(new StartMapShadowAction());
		});
	});

	describe('onEndMapShadow$', () => {
		it('listen to stop map shadow action', () => {
			effectsRunner.queue(new StopMouseShadow());
			let result = null;
			mapAppEffects.onEndMapShadow$.subscribe(_result => {
				result = _result;
			});
			expect(result).toEqual(new StopMapShadowAction());
		});
	});

	xdescribe('onDisplayOverlay', () => {
		let store;

		beforeEach(inject([Store], (_store: Store<IAppState>) => {
			store = _store;

		}));

		it('onDisplayOverlay$ communicator should set Layer on map, calcGeoJSONExtent should have been call only when ignoreExtent is not true', ()=> {
			const mapId = 'mapId';
			const overlayId = 'overlayId';
			let ignoreExtent;
			effectsRunner.queue(new DisplayOverlayAction({id: overlayId, map_id: mapId, ignoreExtent}));
			mapAppEffects.onDisplayOverlay$.subscribe(result=> {
				/*void*/
				expect(result).toBeUndefined();
			});

		});
	});


});
