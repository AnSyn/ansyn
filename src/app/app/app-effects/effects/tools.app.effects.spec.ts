import { ToolsAppEffects } from './tools.app.effects';

import { Observable } from 'rxjs/Observable';
import { cloneDeep } from 'lodash';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { async, inject, TestBed } from '@angular/core/testing';
import {
	IToolsState,
	toolsFeatureKey, toolsFlags,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import {
	GoToAction,
	PullActiveCenter,
	SetActiveCenter,
	SetActiveOverlaysFootprintModeAction,
	SetManualImageProcessingArguments,
	SetPinLocationModeAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { Case } from '@ansyn/core/models/case.model';
import { CasesReducer, ICasesState, SelectCaseAction } from '@ansyn/menu-items/cases';
import { ActiveMapChangedAction, BackToWorldAction, SetMapAutoImageProcessing } from '@ansyn/map-facade';
import {
	AnnotationVisualizerAgentAction,
	DisableImageProcessing,
	EnableImageProcessing,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess
} from '@ansyn/menu-items/tools';
import { DisplayOverlaySuccessAction } from '@ansyn/overlays';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { SetMapManualImageProcessing, SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import { casesFeatureKey, casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { ImageManualProcessArgs } from '@ansyn/core';

describe('ToolsAppEffects', () => {
	let toolsAppEffects: ToolsAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let icaseState: ICasesState;
	let layerState: ILayerState;
	let toolsState: IToolsState;

	const cases: Case[] = [{
		state: {
			time: { type: '', from: new Date(), to: new Date() },
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
					{
						id: 'imagery1',
						data: {
							position: { zoom: 1, center: 2 },
							isAutoImageProcessingActive: true,
							overlay: 'overlay'
						}
					}
				],
				activeMapId: 'imagery1'
			},
			overlaysManualProcessArgs: {
				'overlay_123': { Contrast: 50, Brightness: 20 }
			}
		} as any
	}];
	const imapState: any = {
		mapsList: [
			{
				id: 'imagery1',
				data: {
					position: { zoom: 1, center: 2 },
					isAutoImageProcessingActive: true, overlay: 'overlay'
				}
			}
		],
		activeMapId: 'imagery1'
	};

	beforeEach(() => {
		layerState = cloneDeep(initialLayersState);
		toolsState = cloneDeep(toolsInitialState);
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [

				StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer, [casesFeatureKey]: CasesReducer })
			],
			providers: [
				ToolsAppEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selectedCase = cases[0];
		icaseState = cloneDeep({ cases, selectedCase }) as any;
		imapState.mapsList = selectedCase.state.maps.data;
		imapState.activeMapId = selectedCase.state.maps.activeMapId;

		const fakeStore = new Map<any, any>([
			[casesStateSelector, icaseState],
			[mapStateSelector, imapState],
			[layersStateSelector, layerState],
			[toolsStateSelector, toolsState]
		]);
		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([ImageryCommunicatorService, ToolsAppEffects], (_imageryCommunicatorService: ImageryCommunicatorService, _toolsAppEffects: ToolsAppEffects) => {
		toolsAppEffects = _toolsAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('getActiveCenter$ should get center from active communicator and return SetCenterAction', () => {
		const activeCommunicator = {
			getCenter: () => {
				return { coordinates: [0, 0] };
			}
		};
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		actions = hot('--a--', { a: new PullActiveCenter() });
		const expectedResults = cold('--b--', { b: new SetActiveCenter([0, 0]) });
		expect(toolsAppEffects.getActiveCenter$).toBeObservable(expectedResults);
	});

	describe('updatePinLocationAction$ should createMapSingleClickEvent or removeSingleClickEvent on ', () => {
		const activeCommunicator = {
			createMapSingleClickEvent: () => {
			},
			removeSingleClickEvent: () => {
			}
		};

		beforeEach(() => {
			spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [activeCommunicator, activeCommunicator]);
		});

		it('should call createMapSingleClickEvent per communicator ( action.payload equal "true") ', () => {
			spyOn(activeCommunicator, 'createMapSingleClickEvent');
			const action = new SetPinLocationModeAction(true);
			actions = hot('--a--', { a: action });
			const expectedResults = cold('--b--', { b: action });
			expect(toolsAppEffects.updatePinLocationAction$).toBeObservable(expectedResults);
			expect(activeCommunicator.createMapSingleClickEvent).toHaveBeenCalledTimes(2);
		});

		it('should call removeSingleClickEvent per communicator ( action.payload equal "false") ', () => {
			spyOn(activeCommunicator, 'removeSingleClickEvent');
			const action = new SetPinLocationModeAction(false);
			actions = hot('--a--', { a: new SetPinLocationModeAction(false) });
			const expectedResults = cold('--b--', { b: action });
			expect(toolsAppEffects.updatePinLocationAction$).toBeObservable(expectedResults);
			expect(activeCommunicator.removeSingleClickEvent).toHaveBeenCalled();
		});

	});

	it('onGoTo$ should call SetCenter on active communicator with action.payload', () => {
		const activeCommunicator = jasmine.createSpyObj({
			setCenter: () => {
			}
		});
		spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
		actions = hot('--a--', { a: new GoToAction([0, 0]) });

		const expectedResults = cold('--b--', { b: new SetActiveCenter([0, 0]) });
		expect(toolsAppEffects.onGoTo$).toBeObservable(expectedResults);

		toolsAppEffects.onGoTo$.subscribe();
		const point = {
			type: 'Point',
			coordinates: [0, 0]
		};
		expect(activeCommunicator.setCenter).toHaveBeenCalledWith(point);
	});

	it('should be defined', () => {
		expect(toolsAppEffects).toBeTruthy();
	});

	describe('onActiveMapChanges', () => {
		it('onActiveMapChanges with overlay null should raise DisableImageProcessing', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.overlay = null;
			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
			const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
			expect(toolsAppEffects.onActiveMapChanges$).toBeObservable(expectedResults);
		});

		it('onActiveMapChanges with overlay and image processing as true on should raise EnableImageProcessing and ToggleImageProcessingSuccess with true', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.overlay = 'overlay' as any;
			activeMap.data.isAutoImageProcessingActive = true;
			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
			const expectedResults = cold('--(ab)--', {
				a: new EnableImageProcessing(),
				b: new SetAutoImageProcessingSuccess(true)
			});
			expect(toolsAppEffects.onActiveMapChanges$).toBeObservable(expectedResults);
		});

		it('onActiveMapChanges with overlay and image processing as false on should raise EnableImageProcessing and ToggleImageProcessingSuccess with false', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.overlay = 'overlay' as any;
			activeMap.data.isAutoImageProcessingActive = false;
			actions = hot('--a--', { a: new ActiveMapChangedAction('fakeId') });
			const expectedResults = cold('--(ab)--', {
				a: new EnableImageProcessing(),
				b: new SetAutoImageProcessingSuccess(false)
			});
			expect(toolsAppEffects.onActiveMapChanges$).toBeObservable(expectedResults);
		});

	});

	describe('onDisplayOverlaySuccess', () => {
		it('onDisplayOverlaySuccess with image processing as true should raise EnableImageProcessing, SetMapAutoImageProcessing, SetManualImageProcessingArguments, SetAutoImageProcessingSuccess', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.isAutoImageProcessingActive = true;
			actions = hot('--a--', { a: new DisplayOverlaySuccessAction({ overlay: <any> { id: 'id' } } ) });
			const expectedResults = cold('--(abcd)--', {
				a: new EnableImageProcessing(),
				b: new SetMapAutoImageProcessing({ mapId: 'imagery1', toggleValue: true }),
				c: new SetManualImageProcessingArguments({ processingParams: undefined }),
				d: new SetAutoImageProcessingSuccess(true)
			});
			expect(toolsAppEffects.onDisplayOverlaySuccess$).toBeObservable(expectedResults);
		});


		it('onDisplayOverlaySuccess with image processing as false should raise ToggleMapAutoImageProcessing and ToggleAutoImageProcessingSuccess accordingly', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.isAutoImageProcessingActive = false;
			actions = hot('--a--', { a: new DisplayOverlaySuccessAction({ overlay: <any> { id: 'id' } }) });
			const expectedResults = cold('--(abc)--', {
				a: new EnableImageProcessing(),
				b: new SetManualImageProcessingArguments({ processingParams: undefined }),
				c: new SetAutoImageProcessingSuccess(false)
			});
			expect(toolsAppEffects.onDisplayOverlaySuccess$).toBeObservable(expectedResults);
		});
	});

	describe('onDisplayOverlaySuccess', () => {
		it('onDisplayOverlaySuccess with image manual processing params should raise EnableImageProcessing, SetMapAutoImageProcessing, SetManualImageProcessingArguments, SetAutoImageProcessingSuccess', () => {
			const activeMap = MapFacadeService.activeMap(imapState);
			activeMap.data.isAutoImageProcessingActive = false;
			const processingParams = <ImageManualProcessArgs> { Contrast: 50, Brightness: 20 };

			actions = hot('--a--', { a: new DisplayOverlaySuccessAction({  overlay: <any> { id: 'overlay_123' } }) });

			const expectedResults = cold('--(abcd)--', {
				a: new EnableImageProcessing(),
				b: new SetMapManualImageProcessing({ mapId: 'imagery1', processingParams: processingParams }),
				c: new SetManualImageProcessingArguments({ processingParams: processingParams }),
				d: new SetAutoImageProcessingSuccess(false)
			});
			expect(toolsAppEffects.onDisplayOverlaySuccess$).toBeObservable(expectedResults);
		});
	});

	describe('@Effect onActiveMapChangesSetOverlaysFootprintMode$', () => {
		it('should trigger SetActiveOverlaysFootprintModeAction', () => {
			imapState.activeMap = imapState.mapsList[0];
			imapState.activeMap.data.overlayDisplayMode = <any> 'whatever';
			actions = hot('--a--', { a: new ActiveMapChangedAction('') });
			const expectedResults = cold('--b--', { b: new SetActiveOverlaysFootprintModeAction(<any>'whatever') });
			expect(toolsAppEffects.onActiveMapChangesSetOverlaysFootprintMode$).toBeObservable(expectedResults);
		});
	});

	describe('onActiveMapChangesDrawAnnotation$', () => {
		it('shuold "show" active and "remove" others, while displayAnnotationsLayer is false and annotations flag is true', () => {
			layerState.displayAnnotationsLayer = false;
			toolsState.flags.set(toolsFlags.annotations, true);
			actions = hot('--a--', { a: new ActiveMapChangedAction('') });
			const expectedResults = cold('--(ab)--', {
				a: new AnnotationVisualizerAgentAction({ operation: 'show', relevantMaps: 'active' }),
				b: new AnnotationVisualizerAgentAction({ operation: 'hide', relevantMaps: 'others' })
			});
			expect(toolsAppEffects.onActiveMapChangesDrawAnnotation$).toBeObservable(expectedResults);
		})
	});

	describe('backToWorldView', () => {
		it('backToWorldView should raise DisableImageProcessing', () => {
			actions = hot('--a--', { a: new BackToWorldAction() });
			const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
			expect(toolsAppEffects.backToWorldView$).toBeObservable(expectedResults);
		});
	});

	it('onSelectCase$ should raise DisableImageProcessing', () => {
		actions = hot('--a--', { a: new SelectCaseAction({} as Case) });
		const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
		expect(toolsAppEffects.onSelectCase$).toBeObservable(expectedResults);
	});

	it('toggleAutoImageProcessing with image processing as true should raise ToggleMapAutoImageProcessing, SetMapsDataActionStore and ToggleAutoImageProcessingSuccess accordingly', () => {
		const activeMap = MapFacadeService.activeMap(imapState);
		activeMap.data.isAutoImageProcessingActive = true;
		actions = hot('--a--', { a: new SetAutoImageProcessing() });
		const a = new SetMapAutoImageProcessing({ mapId: 'imagery1', toggleValue: false });
		const b = new SetMapsDataActionStore({ mapsList: imapState.mapsList });
		const c = new SetAutoImageProcessingSuccess(false);
		const expectedResults = cold('--(abc)--', { a, b, c });
		expect(toolsAppEffects.toggleAutoImageProcessing$).toBeObservable(expectedResults);
	});

});
