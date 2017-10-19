// import { ToolsAppEffects } from './tools.app.effects';
//
// import { Observable } from 'rxjs/Observable';
// import { cloneDeep } from 'lodash';
// import { Store, StoreModule } from '@ngrx/store';
// import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
// import { async, inject, TestBed } from '@angular/core/testing';
// import { ToolsReducer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
// import {
// 	GoToAction,
// 	PullActiveCenter,
// 	SetActiveCenter,
// 	SetActiveOverlaysFootprintModeAction,
// 	SetPinLocationModeAction
// } from '@ansyn/menu-items/tools/actions/tools.actions';
// import { Case } from '@ansyn/core/models/case.model';
// import { CasesReducer, ICasesState, SelectCaseAction } from '@ansyn/menu-items/cases';
// import { ActiveMapChangedAction, BackToWorldAction, SetMapAutoImageProcessing } from '@ansyn/map-facade';
// import {
// 	AnnotationVisualizerAgentAction,
// 	DisableImageProcessing,
// 	EnableImageProcessing,
// 	SetAutoImageProcessing,
// 	SetAutoImageProcessingSuccess
// } from '@ansyn/menu-items/tools';
// import { DisplayOverlaySuccessAction } from '@ansyn/overlays';
// import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
// import { SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
//
// describe('ToolsAppEffects', () => {
// 	let toolsAppEffects: ToolsAppEffects;
// 	let actions: Observable<any>;
// 	let store: Store<any>;
// 	let imageryCommunicatorService: ImageryCommunicatorService;
// 	let icaseState: ICasesState;
//
//
// 	const cases: Case[] = [{
// 		state: {
// 			time: { type: '', from: new Date(), to: new Date() },
// 			region: {
// 				type: 'Polygon',
// 				coordinates: [
// 					[
// 						[-64.73, 32.31],
// 						[-80.19, 25.76],
// 						[-66.09, 18.43],
// 						[-64.73, 32.31]
// 					]
// 				]
// 			},
// 			maps: {
// 				data: [
// 					{
// 						id: 'imagery1',
// 						data: {
// 							position: { zoom: 1, center: 2 },
// 							isAutoImageProcessingActive: true,
// 							overlay: 'overlay'
// 						}
// 					}
// 				],
// 				active_map_id: 'imagery1'
// 			}
// 		} as any
// 	}];
// 	const imapState: any = {
// 		mapsList: [
// 			{
// 				id: 'imagery1',
// 				data: { position: { zoom: 1, center: 2 }, isAutoImageProcessingActive: true, overlay: 'overlay' }
// 			}
// 		],
// 		activeMapId: 'imagery1'
// 	};
//
// 	beforeEach(async(() => {
// 		TestBed.configureTestingModule({
// 			imports: [
//
// 				StoreModule.forRoot({ tools: ToolsReducer, cases: CasesReducer })
// 			],
// 			providers: [
// 				ToolsAppEffects,
// 				ImageryCommunicatorService
// 			]
// 		}).compileComponents();
// 	}));
//
// 	beforeEach(inject([Store], (_store: Store<any>) => {
// 		store = _store;
// 		const selectedCase = cases[0];
// 		icaseState = cloneDeep({ cases, selectedCase }) as any;
// 		imapState.mapsList = selectedCase.state.maps.data;
// 		imapState.activeMapId = selectedCase.state.maps.active_map_id;
// 		const fakeStore = { cases: icaseState, map: imapState };
//
// 		spyOn(store, 'select').and.callFake(type => {
// 			return Observable.of(fakeStore[type]);
// 		});
// 	}));
//
// 	beforeEach(inject([ImageryCommunicatorService, ToolsAppEffects], (_imageryCommunicatorService: ImageryCommunicatorService, _toolsAppEffects: ToolsAppEffects) => {
// 		toolsAppEffects = _toolsAppEffects;
//
// 		imageryCommunicatorService = _imageryCommunicatorService;
// 	}));
//
//
// 	it('getActiveCenter$ should get center from active communicator and return SetCenterAction', () => {
// 		const activeCommunicator = {
// 			getCenter: () => {
// 				return { coordinates: [0, 0] };
// 			}
// 		};
// 		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
// 		actions = hot('--a--', { a: new PullActiveCenter() });
// 		let result = null;
// 		toolsAppEffects.getActiveCenter$.subscribe(_result => result = _result);
// 		expect(result.constructor).toEqual(SetActiveCenter);
// 		expect(result.payload).toEqual([0, 0]);
// 	});
//
// 	describe('updatePinLocationAction$ should createMapSingleClickEvent or removeSingleClickEvent on ', () => {
// 		const activeCommunicator = {
// 			createMapSingleClickEvent: () => {
// 			},
// 			removeSingleClickEvent: () => {
// 			}
// 		};
//
// 		beforeEach(() => {
// 			spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [activeCommunicator, activeCommunicator]);
// 		});
//
// 		it('should call createMapSingleClickEvent per communicator ( action.payload equal "true") ', () => {
// 			spyOn(activeCommunicator, 'createMapSingleClickEvent');
// 			actions = hot('--a--', { a: new SetPinLocationModeAction(true) });
// 			toolsAppEffects.updatePinLocationAction$.subscribe();
// 			expect(activeCommunicator.createMapSingleClickEvent).toHaveBeenCalledTimes(2);
// 		});
//
// 		it('should call removeSingleClickEvent per communicator ( action.payload equal "false") ', () => {
// 			spyOn(activeCommunicator, 'removeSingleClickEvent');
// 			actions = hot('--a--', { a: new SetPinLocationModeAction(false) });
// 			toolsAppEffects.updatePinLocationAction$.subscribe();
// 			expect(activeCommunicator.removeSingleClickEvent).toHaveBeenCalled();
// 		});
//
// 	});
//
// 	it('onGoTo$ should call SetCenter on active communicator with action.payload', () => {
// 		const activeCommunicator = jasmine.createSpyObj({
// 			setCenter: () => {
// 			}
// 		});
// 		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
// 		actions = hot('--a--', { a: new GoToAction([0, 0]) });
// 		toolsAppEffects.onGoTo$.subscribe();
// 		const point = {
// 			type: 'Point',
// 			coordinates: [0, 0]
// 		};
// 		expect(activeCommunicator.setCenter).toHaveBeenCalledWith(point);
// 	});
//
// 	it('should be defined', () => {
// 		expect(toolsAppEffects).toBeTruthy();
// 	});
//
// 	describe('onActiveMapChanges', () => {
// 		it('onActiveMapChanges with overlay null should raise DisableImageProcessing', () => {
// 			const activeMap = MapFacadeService.activeMap(imapState);
// 			activeMap.data.overlay = null;
// 			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
// 			let result = null;
// 			toolsAppEffects.onActiveMapChanges$.subscribe(_result => result = _result);
// 			expect(result instanceof DisableImageProcessing).toBeTruthy();
//
// 		});
//
// 		it('onActiveMapChanges with overlay and image processing as true on should raise EnableImageProcessing and ToggleImageProcessingSuccess with true', () => {
// 			const activeMap = MapFacadeService.activeMap(imapState);
// 			activeMap.data.overlay = 'overlay' as any;
// 			activeMap.data.isAutoImageProcessingActive = true;
// 			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
// 			let result = null;
// 			toolsAppEffects.onActiveMapChanges$.subscribe(_result => result = _result);
// 			expect(result instanceof EnableImageProcessing || result instanceof SetAutoImageProcessingSuccess).toBe(true);
//
// 			if (result instanceof SetAutoImageProcessingSuccess) {
// 				expect(result.payload).toBeTruthy();
// 			}
// 		});
//
// 		it('onActiveMapChanges with overlay and image processing as false on should raise EnableImageProcessing and ToggleImageProcessingSuccess with false', () => {
// 			const activeMap = MapFacadeService.activeMap(imapState);
// 			activeMap.data.overlay = 'overlay' as any;
// 			activeMap.data.isAutoImageProcessingActive = false;
// 			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
//
// 			let result = null;
// 			toolsAppEffects.onActiveMapChanges$.subscribe(_result => result = _result);
//
// 			expect(result instanceof EnableImageProcessing || result instanceof SetAutoImageProcessingSuccess).toBe(true);
//
// 			if (result instanceof SetAutoImageProcessingSuccess) {
// 				expect(result.payload).toBeFalsy();
// 			}
// 		});
// 	});
//
// 	describe('onDisplayOverlaySuccess', () => {
// 		it('onDisplayOverlaySuccess with image processing as true should raise ToggleMapAutoImageProcessing and ToggleAutoImageProcessingSuccess accordingly', () => {
// 			const activeMap = MapFacadeService.activeMap(imapState);
// 			activeMap.data.isAutoImageProcessingActive = true;
//
// 			actions = hot('--a--', { a: new DisplayOverlaySuccessAction({ id: 'id' }) });
//
// 			let result = null;
// 			toolsAppEffects.onDisplayOverlaySuccess$.subscribe(_result => result = _result);
//
// 			expect(result instanceof SetMapAutoImageProcessing ||
// 				result instanceof SetAutoImageProcessingSuccess ||
// 				result instanceof EnableImageProcessing
// 			).toBe(true);
//
// 			if (result instanceof SetAutoImageProcessingSuccess) {
// 				expect(result.payload).toBeTruthy();
// 			}
//
// 			if (result instanceof SetMapAutoImageProcessing) {
// 				const toggleMapResult: SetMapAutoImageProcessing = result;
// 				expect(toggleMapResult.payload.mapId).toBe('imagery1');
// 				expect(toggleMapResult.payload.toggle_value).toBeTruthy();
// 			}
// 		});
// 	});
//
// 	it('onActiveMapChangesSetOverlaysFootprintMode$ should change footprint mode', () => {
// 		const active_map = MapFacadeService.activeMap(imapState);
// 		active_map.data.overlayDisplayMode = <any> 'whatever';
//
// 		actions = hot('--a--', { a: new ActiveMapChangedAction('') });
//
// 		let action1, action2, action3;
// 		let count = 0;
// 		toolsAppEffects.onActiveMapChangesSetOverlaysFootprintMode$.subscribe(_result => {
// 			count++;
// 			switch (count) {
// 				case 1:
// 					action1 = _result;
// 					break;
// 				case 2:
// 					action2 = _result;
// 					break;
// 				case 3:
// 					action3 = _result;
// 					break;
// 			}
// 		});
// 		expect(action1.constructor).toEqual(SetActiveOverlaysFootprintModeAction);
// 		expect(action1.payload).toEqual('whatever');
//
// 		expect(action2.constructor).toEqual(AnnotationVisualizerAgentAction);
// 		expect(action2.payload).toEqual({
// 			action: 'removeLayer',
// 			maps: 'all'
// 		});
//
// 		expect(action3.constructor).toEqual(AnnotationVisualizerAgentAction);
// 		expect(action3.payload).toEqual({
// 			action: 'show',
// 			maps: 'all'
// 		});
// 	});
//
// 	it('onDisplayOverlaySuccess with image processing as false should raise ToggleMapAutoImageProcessing and ToggleAutoImageProcessingSuccess accordingly', () => {
// 		const activeMap = MapFacadeService.activeMap(imapState);
// 		activeMap.data.isAutoImageProcessingActive = false;
//
// 		actions = hot('--a--', { a: new DisplayOverlaySuccessAction({ id: 'id' }) });
//
// 		let result = null;
// 		toolsAppEffects.onDisplayOverlaySuccess$.subscribe(_result => result = _result);
//
// 		expect(result instanceof SetMapAutoImageProcessing ||
// 			result instanceof SetAutoImageProcessingSuccess ||
// 			result instanceof EnableImageProcessing).toBe(true);
//
// 		if (result instanceof SetAutoImageProcessingSuccess) {
// 			expect(result.payload).toBeFalsy();
// 		}
//
// 		if (result instanceof SetMapAutoImageProcessing) {
// 			const toggleMapResult: SetMapAutoImageProcessing = result;
// 			expect(toggleMapResult.payload.mapId).toBe('imagery1');
// 			expect(toggleMapResult.payload.toggle_value).toBeFalsy();
// 		}
// 	});
//
// 	describe('backToWorldView', () => {
// 		it('backToWorldView should raise DisableImageProcessing', () => {
// 			actions = hot('--a--', { a: new BackToWorldAction() });
//
// 			let result = null;
// 			toolsAppEffects.backToWorldView$.subscribe(_result => result = _result);
// 			expect(result instanceof DisableImageProcessing).toBeTruthy();
//
// 		});
// 	});
//
// 	describe('onSelectCaseById', () => {
// 		it('onSelectCaseById should raise DisableImageProcessing', () => {
// 			actions = hot('--a--', { a: new SelectCaseAction({} as Case) });
//
// 			let result = null;
// 			toolsAppEffects.onSelectCase$.subscribe(_result => result = _result);
// 			expect(result instanceof DisableImageProcessing).toBeTruthy();
//
// 		});
// 	});
//
// 	describe('toggleAutoImageProcessing', () => {
// 		it('toggleAutoImageProcessing with image processing as true should raise ToggleMapAutoImageProcessing, SetMapsDataActionStore and ToggleAutoImageProcessingSuccess accordingly', () => {
// 			const activeMap = MapFacadeService.activeMap(imapState);
// 			activeMap.data.isAutoImageProcessingActive = true;
//
// 			actions = hot('--a--', { a: new SetAutoImageProcessing() });
//
// 			let result = null;
// 			toolsAppEffects.toggleAutoImageProcessing$.subscribe(_result => result = _result);
//
// 			expect(result instanceof SetMapAutoImageProcessing || result instanceof SetMapsDataActionStore
// 				|| result instanceof SetAutoImageProcessingSuccess).toBe(true);
//
// 			if (result instanceof SetMapAutoImageProcessing) {
// 				const setMapImageProcessingResult: SetMapAutoImageProcessing = result;
// 				expect(setMapImageProcessingResult.payload.mapId).toBe('imagery1');
// 				expect(setMapImageProcessingResult.payload.toggle_value).toBeFalsy();
// 			}
//
// 			if (result instanceof SetMapsDataActionStore) {
// 				expect(activeMap.data.isAutoImageProcessingActive).toBeFalsy();
// 			}
//
// 			if (result instanceof SetAutoImageProcessingSuccess) {
// 				expect(result.payload).toBeFalsy();
// 			}
// 		});
// 	});
// });
