import { ToolsAppEffects } from './tools.app.effects';

import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { async, inject, TestBed } from '@angular/core/testing';
import {
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import {
	DisableImageProcessing,
	GoToAction,
	PullActiveCenter,
	SetActiveCenter,
	SetActiveOverlaysFootprintModeAction, SetAnnotationMode,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess, SetMeasureDistanceToolState, SetPinLocationModeAction, ShowOverlaysFootprintAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { ICase } from '@ansyn/core';
import { DisplayOverlaySuccessAction } from '@ansyn/overlays/actions/overlays.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import {
	ActiveMapChangedAction
} from '@ansyn/map-facade/actions/map.actions';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import {
	BackToWorldView,
	ClearActiveInteractionsAction,
	SetMapsDataActionStore
} from '@ansyn/core';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';

describe('ToolsAppEffects', () => {
	let toolsAppEffects: ToolsAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let icaseState: ICasesState;
	let layerState: ILayerState;
	let toolsState: IToolsState;

	const cases: ICase[] = [{
		id: '1',
		name: 'name',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		autoSave: false,
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
					isAutoImageProcessingActive: true,
					overlay: { id: 'id' },
					imageManualProcessArgs: {}

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
				ImageryCommunicatorService,
				{
					provide: toolsConfig, useValue: {
						GoTo: {
							from: '',
							to: ''
						},
						Proj4: {
							ed50: '+proj=utm +datum=ed50 +zone=${zone} +ellps=intl +units=m + no_defs',
							ed50Customized: ''
						},
						ImageProcParams:
							[
								{
									name: 'Sharpness',
									defaultValue: 0,
									min: 0,
									max: 100
								},
								{
									name: 'Contrast',
									defaultValue: 0,
									min: -100,
									max: 100
								},
								{
									name: 'Brightness',
									defaultValue: 100,
									min: -100,
									max: 100
								},
								{
									name: 'Gamma',
									defaultValue: 100,
									min: 1,
									max: 200
								},
								{
									name: 'Saturation',
									defaultValue: 0,
									min: 1,
									max: 100
								}
							]
					}
				}
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
				return Observable.of({ coordinates: [0, 0] });
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
	});

	it('onGoTo$ should call SetCenter on active communicator with action.payload', () => {
		const activeCommunicator = jasmine.createSpyObj({
			setCenter: () => {
			}
		});

		activeCommunicator.setCenter.and.callFake(() => Observable.of(true));
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


	describe('onDisplayOverlaySuccess', () => {
		const manualProcessArgs = {
			Sharpness: 0,
			Contrast: 0,
			Brightness: 100,
			Gamma: 100,
			Saturation: 0
		};

		it('onDisplayOverlaySuccess with id and given args should raise SetMapsDataActionStore with the given args', () => {
			const overlayId = 'id';

			const args = {
				Brightness: 1,
				Contrast: 2,
				Gamma: 3,
				Saturation: 4,
				Sharpness: 5
			};

			toolsState.overlaysManualProcessArgs = { [overlayId]: args };

			actions = hot('--a--', {
				a: new DisplayOverlaySuccessAction({
					overlay: <any> { id: overlayId },
					mapId: 'imagery1'
				})
			});

			const updatedMapList = cloneDeep(imapState.mapsList);
			updatedMapList[0].data.imageManualProcessArgs = args;

			const expectedResults = cold('--(a)--', {
				a: new SetMapsDataActionStore({ mapsList: updatedMapList })
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

	describe('backToWorldView', () => {
		it('backToWorldView should raise DisableImageProcessing', () => {
			const activeCommunicator = {
			};
			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => activeCommunicator);
			actions = hot('--a--', { a: new BackToWorldView({ mapId: 'mapId' }) });
			const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
			expect(toolsAppEffects.backToWorldView$).toBeObservable(expectedResults);
		});
	});

	it('onSelectCase$ should raise DisableImageProcessing', () => {
		actions = hot('--a--', { a: new SelectCaseAction({} as ICase) });
		const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
		expect(toolsAppEffects.onSelectCase$).toBeObservable(expectedResults);
	});

	it('toggleAutoImageProcessing with image processing as true should raise ToggleMapAutoImageProcessing, SetMapsDataActionStore and ToggleAutoImageProcessingSuccess accordingly', () => {
		const activeMap = MapFacadeService.activeMap(imapState);
		activeMap.data.isAutoImageProcessingActive = true;
		actions = hot('--a--', { a: new SetAutoImageProcessing() });
		const expectedResults = cold('--(ab)--', {
			a: new SetMapsDataActionStore({ mapsList: [...imapState.mapsList] }),
			b: new SetAutoImageProcessingSuccess(false)
		});
		expect(toolsAppEffects.toggleAutoImageProcessing$).toBeObservable(expectedResults);
	});

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Heatmap"', () => {
		const updatedMapsList = [...imapState.mapsList];
		const activeMap = MapFacadeService.mapById(updatedMapsList, imapState.activeMapId);
		activeMap.data.overlayDisplayMode = 'Heatmap';

		actions = hot('--a--', { a: new ShowOverlaysFootprintAction('Heatmap') });

		const expectedResults = cold('--a--', { a: new SetMapsDataActionStore({ mapsList: updatedMapsList }) });

		expect(toolsAppEffects.updateCaseFromTools$).toBeObservable(expectedResults);
	});

	it('clearActiveInteractions$ should clear active interactions', () => {
		actions = hot('--a--', { a: new ClearActiveInteractionsAction() });

		const expectedResult = cold('--(abcd)--', {
			a: new SetMeasureDistanceToolState(false),
			b: new SetAnnotationMode(),
			c: new UpdateGeoFilterStatus(),
			d: new SetPinLocationModeAction(false)
		});

		expect(toolsAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});

	it('clearActiveInteractions$ should clear active interactions without SetMeasureDistanceToolState', () => {
		actions = hot('--a--', {
			a: new ClearActiveInteractionsAction({
				skipClearFor: [SetMeasureDistanceToolState]
			})
		});

		const expectedResult = cold('--(bce)--', {
			b: new SetAnnotationMode(),
			c: new UpdateGeoFilterStatus(),
			e: new SetPinLocationModeAction(false)
		});

		expect(toolsAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});
});
