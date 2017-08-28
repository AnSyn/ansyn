import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { ContextMenuAppEffects } from './context-menu.app.effects';
import { Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { VisualizersAppEffects } from './visualizers.app.effects';
import { HoverFeatureChangedTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import { OverlaysMarkupAction } from '@ansyn/overlays/actions/overlays.actions';
import {
	DisplayOverlayFromStoreAction, MouseOutDropAction,
	MouseOverDropAction, SetFiltersAction
} from '@ansyn/overlays/actions/overlays.actions';
import {
	dbclickFeatureTriggerAction, DrawOverlaysOnMapTriggerAction,
	MapActionTypes
} from '@ansyn/map-facade/actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import {
	AddCaseSuccessAction, CasesActionTypes,
	SelectCaseByIdAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Case } from '@ansyn/core/models/case.model';
import { EventEmitter } from '@angular/core';
import { ShowOverlaysFootprintAction } from '@ansyn/menu-items/tools/actions/tools.actions';

describe('VisualizersAppEffects', () => {
	let visualizersAppEffects: VisualizersAppEffects;
	let store: Store<any>;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;

	const selectedCase: Case = {
		id: '1234-5678',
		state:
			{
				maps:
					{
						active_map_id: 'active_map_id',
						data: [
							{
								id: 'active_map_id',
								data: {
									overlayDisplayMode: 'Polygon'
								}
							},
							{
								id: 'not_active_map_id',
								data: {}
							},
							{
								id: 'not_active_map_id',
								data: {}
							},

						]
					}
			}
	} as Case;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({cases: CasesReducer})
			],
			providers: [
				VisualizersAppEffects,
				ImageryCommunicatorService
			]

		}).compileComponents();
	}));

	beforeEach(inject([Store, VisualizersAppEffects, EffectsRunner, ImageryCommunicatorService], (_store: Store<any>, _visualizersAppEffects: VisualizersAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService) => {
		store = _store;
		visualizersAppEffects= _visualizersAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
		store.dispatch(new AddCaseSuccessAction(selectedCase));
		store.dispatch(new SelectCaseByIdAction(selectedCase.id));
	}));

	it('onHoverFeatureSetMarkup$ should call getOverlaysMarkup with overlay hoverId, result should be send as payload of OverlaysMarkupAction', () => {
		const markup = [{id: '1234', class: 'active'}];
		spyOn(CasesService, 'getOverlaysMarkup').and.callFake(() => markup);
		effectsRunner.queue(new HoverFeatureChangedTriggerAction('fakeId'));
		let result;
		visualizersAppEffects.onHoverFeatureSetMarkup$.subscribe(_result => {result = _result;});
		expect(result.constructor).toEqual(OverlaysMarkupAction);
		expect(result.payload).toEqual(markup);
	});

	it('onHoverFeatureEmitSyncHoverFeature$ should send syncHoverFeature.emit per communicator FootprintPolylineVisualizerType', () => {
		const fakeVisualizer = {
			syncHoverFeature: new EventEmitter()
		};
		const fakeCommunicator = {
			getVisualizer: (): any => fakeVisualizer
		};
		spyOn(fakeVisualizer.syncHoverFeature, 'emit');
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator ]);
		effectsRunner.queue(new HoverFeatureChangedTriggerAction('fakeId'));
		visualizersAppEffects.onHoverFeatureEmitSyncHoverFeature$.subscribe();
		expect(fakeCommunicator.getVisualizer().syncHoverFeature.emit).toHaveBeenCalledTimes(2);
	});

	describe('onMouseOverDropAction$ should return HoverFeatureChangedTriggerAction (with "id" if MouseOverDropAction else "undefined")', () => {

		it('with "id" if MouseOverDropAction',  () => {
			effectsRunner.queue(new MouseOverDropAction('fakeId'));
			let result;
			visualizersAppEffects.onMouseOverDropAction$ .subscribe((_result) => {result = _result;});
			expect(result.constructor).toEqual(HoverFeatureChangedTriggerAction);
			expect(result.payload).toEqual('fakeId')
		});

		it('with "undefined" if not MouseOverDropAction', () => {
			effectsRunner.queue(new MouseOutDropAction('fakeId'));
			let result;
			visualizersAppEffects.onMouseOverDropAction$ .subscribe((_result) => {result = _result;});
			expect(result.constructor).toEqual(HoverFeatureChangedTriggerAction);
			expect(result.payload).toBeUndefined();
		});

	});

	it('onDbclickFeatureDisplayAction$ should call displayOverlayFromStoreAction with id from payload', () => {
		effectsRunner.queue(new dbclickFeatureTriggerAction('fakeId'));
		let result: DisplayOverlayFromStoreAction;
		visualizersAppEffects.onDbclickFeatureDisplayAction$.subscribe(_result => result = _result);
		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
		expect(result.payload.id).toEqual('fakeId');
	});

	it('markupVisualizer$ should send markupFeatures.emit per communicator', () => {
		const fakeVisualizer = {
			markupFeatures: new EventEmitter()
		};
		const fakeCommunicator = {
			getVisualizer: (): any => fakeVisualizer
		};
		spyOn(fakeVisualizer.markupFeatures, 'emit');
		spyOn(imageryCommunicatorService, 'communicatorsAsArray').and.callFake(() => [fakeCommunicator, fakeCommunicator, fakeCommunicator ]);
		effectsRunner.queue(new OverlaysMarkupAction([1,2,3,4]));
		visualizersAppEffects.markupVisualizer$.subscribe();
		expect(fakeCommunicator.getVisualizer().markupFeatures.emit).toHaveBeenCalledWith([1,2,3,4]);
		expect(fakeCommunicator.getVisualizer().markupFeatures.emit).toHaveBeenCalledTimes(3);
	});

	it('Effect : updateCaseFromTools$ - with OverlayVisualizerMode === "Hitmap"' ,() => {
		effectsRunner.queue(new ShowOverlaysFootprintAction('Hitmap'));
		let count = 0;
		visualizersAppEffects.updateCaseFromTools$.subscribe((_result: any)=>{
			expect(_result.type === CasesActionTypes.UPDATE_CASE || _result.type === MapActionTypes.DRAW_OVERLAY_ON_MAP).toBeTruthy();
			if(_result.type === CasesActionTypes.UPDATE_CASE){
				expect(_result.payload.state.maps.data[0].data.overlayDisplayMode).toBe('Hitmap');
			}
			count++;
		});
		expect(count).toBe(2);
	});

	it('shouldDrawOverlaysOnMap$ should return DrawOverlaysOnMapTriggerAction ( SET_FILTERS action) ', () => {
		effectsRunner.queue(new SetFiltersAction({}));
		let result;
		visualizersAppEffects.shouldDrawOverlaysOnMap$.subscribe(_result => { result = _result; });
		expect(result.constructor).toEqual(DrawOverlaysOnMapTriggerAction);
	});

	it('drawOverlaysOnMap$ should call drawOverlayOnMap() for each map(from selected case)', () => {
		spyOn(visualizersAppEffects, 'drawOverlaysOnMap');
		effectsRunner.queue(new DrawOverlaysOnMapTriggerAction());
		let result;
		visualizersAppEffects.drawOverlaysOnMap$.subscribe();
		expect(visualizersAppEffects.drawOverlaysOnMap).toHaveBeenCalledTimes(3);
	});

	// it('drawFootprintsFromCommunicatorAdded$ effect should use draw overlays overlays-display-mode if added communicator has "overlayDisplayMode" Hitmap in case', () => {
	// 	effectsRunner.queue(new AddMapInstacneAction({currentCommunicatorId: 'imagery1'}));
	//
	// 	const commEntitiy = {
	// 		getVisualizer:(visType) => {}
	// 	};
	// 	const visEntitiy = {
	// 		setEntities:(entities) => {},
	// 		clearEntities:() => {}
	// 	};
	//
	// 	const drops = [{id: 'id', name: 'name', footprint: {}}];
	// 	spyOn(OverlaysService, 'pluck').and.callFake(() => drops);
	//
	// 	spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
	// 	spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);
	//
	// 	spyOn(visEntitiy, 'setEntities');
	// 	spyOn(visEntitiy, 'clearEntities');
	//
	// 	overlaysAppEffects.drawFootprintsFromCommunicatorAdded$.subscribe();
	//
	// 	expect(visEntitiy.setEntities).toHaveBeenCalled();
	// 	expect(visEntitiy.clearEntities).toHaveBeenCalled();
	// });
	//
	// it('drawFootprintsFromCommunicatorAdded$ effect should NOT draw overlays overlays-display-mode if added communicator has "overlayDisplayMode" = None in case', () => {
	// 	effectsRunner.queue(new AddMapInstacneAction({currentCommunicatorId: 'imagery2'}));
	//
	// 	const commEntitiy = {
	// 		getVisualizer:(visType) => {}
	// 	};
	// 	const visEntitiy = {
	// 		setEntities:(entities) => {},
	// 		clearEntities:() => {}
	// 	};
	//
	// 	const drops = [{id: 'id', name: 'name', footprint: {}}];
	// 	spyOn(OverlaysService, 'pluck').and.callFake(() => drops);
	//
	// 	spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
	// 	spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);
	//
	// 	spyOn(visEntitiy, 'setEntities');
	// 	spyOn(visEntitiy, 'clearEntities');
	//
	// 	overlaysAppEffects.drawFootprintsFromCommunicatorAdded$.subscribe();
	//
	// 	expect(visEntitiy.setEntities).not.toHaveBeenCalled();
	// 	expect(visEntitiy.clearEntities).toHaveBeenCalledTimes(2);
	// });
	//
	// it('drawFootprintsFromFilteredOverlays$ effect should draw overlays overlays-display-mode if selected case/active map has overlayDisplayMode="Hitmap"', () => {
	// 	effectsRunner.queue(new SetFiltersAction([]));
	//
	// 	const commEntitiy = {
	// 		getVisualizer:(visType) => {}
	// 	};
	// 	const visEntitiy = {
	// 		setEntities:(entities) => {},
	// 		clearEntities:() => {}
	// 	};
	//
	// 	const drops = [{id: 'id', name: 'name', footprint: {}}];
	// 	spyOn(OverlaysService, 'pluck').and.callFake(() => drops);
	//
	// 	spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
	// 	spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);
	//
	// 	spyOn(visEntitiy, 'setEntities');
	// 	spyOn(visEntitiy, 'clearEntities');
	//
	// 	overlaysAppEffects.drawFootprintsFromFilteredOverlays$.subscribe();
	//
	// 	expect(visEntitiy.setEntities).toHaveBeenCalled();
	// 	expect(visEntitiy.clearEntities).toHaveBeenCalled();
	// });
	//
	// it('setActiveOverlaysModeFromLoadSuccess$ effect should dispatch SetActiveOverlaysFootprintModeAction when overlays are loaded', () => {
	// 	effectsRunner.queue(new SetFiltersAction([]));
	// 	let result = null;
	// 	overlaysAppEffects.setActiveOverlaysModeFromLoadSuccess$.subscribe((_result) => {
	// 		result = _result;
	// 	});
	// 	expect(result).toBeTruthy();
	// 	expect(result.constructor).toEqual(SetActiveOverlaysFootprintModeAction);
	// 	expect(result.payload).toEqual('Hitmap');
	// });

});
