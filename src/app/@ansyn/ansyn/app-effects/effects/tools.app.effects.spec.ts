import { BackToWorldView } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { ToolsAppEffects } from './tools.app.effects';
import { Observable, of } from 'rxjs';
import { cloneDeep } from 'lodash';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { async, inject, TestBed } from '@angular/core/testing';
import { MapFacadeService, mapStateSelector, UpdateMapAction } from '@ansyn/map-facade';
import { cold, hot } from 'jasmine-marbles';
import { provideMockActions } from '@ngrx/effects/testing';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '../../modules/menu-items/layers-manager/reducers/layers.reducer';
import {
	IToolsState,
	toolsFeatureKey,
	toolsInitialState,
	ToolsReducer,
	toolsStateSelector
} from '../../modules/menu-items/tools/reducers/tools.reducer';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState
} from '../../modules/menu-items/cases/reducers/cases.reducer';
import {
	ClearActiveInteractionsAction,
	DisableImageProcessing,
	GoToAction,
	PullActiveCenter,
	SetActiveCenter,
	SetAnnotationMode,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	SetPinLocationModeAction,
	SetSubMenu,
	ShowOverlaysFootprintAction, UpdateMeasureDataOptionsAction
} from '../../modules/menu-items/tools/actions/tools.actions';
import { SelectCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import { UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import { ICase, ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { LoggerService } from '../../modules/core/services/logger.service';
import { selectMapsIds } from '@ansyn/map-facade';

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
		entities: {
			'imagery1': {
				id: 'imagery1',
				data: {
					position: { zoom: 1, center: 2 },
					isAutoImageProcessingActive: true,
					overlay: { id: 'id' },
					imageManualProcessArgs: {}

				}
			}
		},
		ids: ['imagery1'],
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
				},
				{
					provide: LoggerService, useValue: {
						error: (some) => null, info: () => {
						}
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const selectedCase = cases[0];
		icaseState = cloneDeep({ cases, selectedCase }) as any;
		imapState.entities = selectedCase.state.maps.data.reduce((obj, map) => ({ ...obj, [map.id]: map }), {});
		imapState.activeMapId = selectedCase.state.maps.activeMapId;
		const mapIds: string[] = [];
		selectedCase.state.maps.data.forEach((data: ICaseMapState) => {
			mapIds.push(data.id);
		});

		const fakeStore = new Map<any, any>([
			[casesStateSelector, icaseState],
			[mapStateSelector, imapState],
			[layersStateSelector, layerState],
			[toolsStateSelector, toolsState],
			[selectMapsIds, mapIds],
		]);
		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(inject([ImageryCommunicatorService, ToolsAppEffects], (_imageryCommunicatorService: ImageryCommunicatorService, _toolsAppEffects: ToolsAppEffects) => {
		toolsAppEffects = _toolsAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('getActiveCenter$ should get center from active communicator and return SetCenterAction', () => {
		const activeCommunicator = {
			getCenter: () => {
				return of({ coordinates: [0, 0] });
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

		activeCommunicator.setCenter.and.callFake(() => of(true));
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
	});

	describe('backToWorldView', () => {
		it('backToWorldView should raise DisableImageProcessing', () => {
			const activeCommunicator = {};
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

	it('toggleAutoImageProcessing with image processing as true should raise ToggleMapAutoImageProcessing, UpdateMapAction and ToggleAutoImageProcessingSuccess accordingly', () => {
		const activeMap = MapFacadeService.activeMap(imapState);
		const isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
		actions = hot('--a--', { a: new SetAutoImageProcessing() });
		const expectedResults = cold('--(ab)--', {
			a: new UpdateMapAction({
				id: activeMap.id,
				changes: { data: { ...activeMap.data, isAutoImageProcessingActive } }
			}),
			b: new SetAutoImageProcessingSuccess(isAutoImageProcessingActive)
		});
		expect(toolsAppEffects.toggleAutoImageProcessing$).toBeObservable(expectedResults);
	});

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Heatmap"', () => {
		const activeMap = MapFacadeService.activeMap(imapState);
		const overlayDisplayMode = 'Heatmap';

		actions = hot('--a--', { a: new ShowOverlaysFootprintAction(overlayDisplayMode) });

		const expectedResults = cold('--a--', {
			a: new UpdateMapAction({
				id: activeMap.id, changes: {
					data: {
						...activeMap.data,
						overlayDisplayMode: overlayDisplayMode
					}
				}
			})
		});

		expect(toolsAppEffects.updateCaseFromTools$).toBeObservable(expectedResults);
	});

	it('clearActiveInteractions$ should clear active interactions', () => {
		actions = hot('--a--', { a: new ClearActiveInteractionsAction() });

		const expectedResult = cold('--(bcde)--', {
			b: new SetAnnotationMode(null),
			c: new UpdateGeoFilterStatus(),
			d: new SetPinLocationModeAction(false),
			e: new UpdateMeasureDataOptionsAction({
				mapId: 'imagery1',
				options: { isToolActive: false }
			})
		});

		expect(toolsAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});

	it('clearActiveInteractions$ should clear active interactions without SetMeasureDistanceToolState', () => {
		actions = hot('--a--', {
			a: new ClearActiveInteractionsAction({
				skipClearFor: [SetAnnotationMode]
			})
		});

		const expectedResult = cold('--(bcd)--', {
			b: new UpdateGeoFilterStatus(),
			c: new SetPinLocationModeAction(false),
			d: new UpdateMeasureDataOptionsAction({
				mapId: 'imagery1',
				options: { isToolActive: false }
			})
		});

		expect(toolsAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});

	it('setSubMenu to null should call setPinLocationMode with false', () => {
		actions = hot('--a--', {
			a: new SetSubMenu(null)
		});
		const expectdResult = cold('--b--', {
			b: new SetPinLocationModeAction(false)
		});
		expect(toolsAppEffects.onCloseGoTo$).toBeObservable(expectdResult);
	});
});
