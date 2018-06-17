import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
	casesFeatureKey,
	CasesReducer,
	casesStateSelector,
	ICasesState,
	initialCasesState
} from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { VisualizersAppEffects } from './visualizers.app.effects';
import {
	DrawOverlaysOnMapTriggerAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import {
	SetFilteredOverlaysAction
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import {
	AddCaseAction,
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import {
	SetAnnotationMode,
	SetMeasureDistanceToolState, SetPinLocationModeAction,
	ShowOverlaysFootprintAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import {
	IMapState,
	initialMapState,
	mapFeatureKey,
	MapReducer,
	mapStateSelector
} from '@ansyn/map-facade/reducers/map.reducer';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable } from 'rxjs/Observable';
import {
	ILayerState,
	initialLayersState,
	layersStateSelector
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { cloneDeep } from 'lodash';
import { coreInitialState, coreStateSelector, selectSelectedCase } from '@ansyn/core/reducers/core.reducer';
import { ClearActiveInteractionsAction, SelectCaseAction } from '@ansyn/core/actions/core.actions';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';


describe('VisualizersAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let actions: Observable<any>;
	let imageryCommunicatorService: ImageryCommunicatorService = null;
	let coreState = coreInitialState;
	let caseState: ICasesState = cloneDeep(initialCasesState);
	let layersState: ILayerState = cloneDeep(initialLayersState);
	let mapState: IMapState = cloneDeep(initialMapState);

	const selectedCase: Case = {
		id: '1234-5678',
		state:
			{
				maps:
					{
						activeMapId: 'activeMapId',
						data: [
							{
								id: 'activeMapId',
								data: {
									overlayDisplayMode: 'Polygon'
								}
							},
							{
								id: 'notActiveMapId1',
								data: {}
							},
							{
								id: 'notActiveMapId2',
								data: {}
							}

						]
					},
				layers: {
					annotationsLayer: {}
				}
			}
	} as Case;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [casesFeatureKey]: CasesReducer, [mapFeatureKey]: MapReducer })
			],
			providers: [
				VisualizersAppEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		store.dispatch(new AddCaseAction(selectedCase));
		store.dispatch(new SelectCaseAction(selectedCase));
		store.dispatch(new SetMapsDataActionStore({
			mapsList: selectedCase.state.maps.data,
			activeMapId: selectedCase.state.maps.activeMapId
		}));

		coreState.selectedCase = selectedCase;
		const fakeStore = new Map<any, any>([
			[casesStateSelector, caseState],
			[layersStateSelector, layersState],
			[mapStateSelector, mapState],
			[coreStateSelector, coreState],
			[selectSelectedCase, coreState.selectedCase]
		]);

		spyOn(store, 'select').and.callFake(type => Observable.of(fakeStore.get(type)));
	}));

	beforeEach(inject([Store, VisualizersAppEffects, ImageryCommunicatorService], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		visualizersAppEffects = _visualizersAppEffects;
		imageryCommunicatorService = _imageryCommunicatorService;

	}));

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Heatmap"', () => {
		mapState.mapsList = [...selectedCase.state.maps.data];
		mapState.activeMapId = selectedCase.state.maps.activeMapId;
		const updatedMapsList = cloneDeep(mapState.mapsList);
		updatedMapsList[0].data.overlayDisplayMode = 'Heatmap';

		actions = hot('--a--', {
			a: new ShowOverlaysFootprintAction('Heatmap')
		});

		const expectedResults = cold('--(ab)--', {
			a: new SetMapsDataActionStore({ mapsList: updatedMapsList }),
			b: new DrawOverlaysOnMapTriggerAction()
		});

		expect(visualizersAppEffects.updateCaseFromTools$).toBeObservable(expectedResults);
	});

	it('shouldDrawOverlaysOnMap$ should return DrawOverlaysOnMapTriggerAction ( SET_FILTERS action) ', () => {
		actions = hot('--a--', { a: new SetFilteredOverlaysAction([]) });
		const expectedResults = cold('--b--', { b: new DrawOverlaysOnMapTriggerAction() });
		expect(visualizersAppEffects.shouldDrawOverlaysOnMap$).toBeObservable(expectedResults);
	});


	it('clearActiveInteractions$ should clear active interactions', () => {
		actions = hot('--a--', { a: new ClearActiveInteractionsAction() });

		const expectedResult = cold('--(abcd)--', {
			a: new SetMeasureDistanceToolState(false),
			b: new SetAnnotationMode(),
			c: new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false}),
			d: new SetPinLocationModeAction(false)
		});

		expect(visualizersAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});

	it('clearActiveInteractions$ should clear active interactions without SetMeasureDistanceToolState', () => {
		actions = hot('--a--', {
			a: new ClearActiveInteractionsAction({
				skipClearFor: [SetMeasureDistanceToolState]
			})
		});

		const expectedResult = cold('--(bce)--', {
			b: new SetAnnotationMode(),
			c: new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false}),
			e: new SetPinLocationModeAction(false)
		});

		expect(visualizersAppEffects.clearActiveInteractions$).toBeObservable(expectedResult);
	});
});
