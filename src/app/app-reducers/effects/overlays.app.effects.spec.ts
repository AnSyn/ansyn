import { inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { OverlaysAppEffects } from './overlays.app.effects';
import { LoadOverlaysSuccessAction, OverlaysActionTypes, LoadOverlaysAction,
	DisplayOverlayFromStoreAction, SetFiltersAction } from '@ansyn/overlays/actions/overlays.actions';
import { CasesReducer, Case, CasesService, AddCaseSuccessAction, SelectCaseByIdAction } from '@ansyn/menu-items/cases';
import { OverlaysConfig, OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { HttpModule } from '@angular/http';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { OverlaySourceProviderMock } from '@ansyn/overlays/services/overlays.service.spec';
import { OverlayReducer, IOverlayState, overlayInitialState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { Observable } from 'rxjs/Observable';
import { cloneDeep } from 'lodash';
import { IToolsState, ToolsReducer, toolsInitialState } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { AddMapInstacneAction } from '../../packages/map-facade/actions/map.actions';

describe('OverlaysAppEffects',()=> {
	let overlaysAppEffects: OverlaysAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let overlaysService: OverlaysService;
	let imageryCommunicatorService: ImageryCommunicatorService;

	let icaseState: ICasesState;
	let toolsState: IToolsState;
	let overlaysState: IOverlayState;
	let imageryCommunicatorServiceMock = {
		provide:() => {}
	};

	const caseItem: Case =  {
		"id": "31b33526-6447-495f-8b52-83be3f6b55bd",
		"state": {
			"region": {
				"type": "FeatureCollection",
				"features": [{
					"type": "Feature",
					"properties": {
						"MUN_HEB": "Hasharon",
						"MUN_ENG": "Hasharon"
					},
					"geometry": {
						"type": "Polygon",
						"coordinates": [
							[
								[35.71991824722275, 32.709192409794866],
								[35.54566531753454, 32.393992011030576]
							]


						]
					}
				}]
			},
			"time": {
				"type": "absolute",
				"from": new Date("2013-06-27T08:43:03.624Z"),
				"to": new Date("2015-04-17T03:55:12.129Z")
			},
			maps: {
				data: [
					{id: 'imagery1', data: {overlayDisplayMode: 'Hitmap'}},
					{id: 'imagery2', data: {overlayDisplayMode: 'None'}},
					{id: 'imagery3', data: {}},
				],
				active_map_id: 'imagery1'
			}
		}
	} as any;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				HttpModule,

				StoreModule.provideStore({ cases: CasesReducer, overlays: OverlayReducer, tools: ToolsReducer}),
			],
			providers:[
				OverlaysAppEffects,
				OverlaysService,
				{ provide: BaseOverlaySourceProvider, useClass :OverlaySourceProviderMock},
				{ provide: OverlaysConfig, useValue: {} },
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null,
						contextValues: {imageryCount: -1}
					}
				},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store],(_store) => {
		store = _store;
		spyOn(store, 'select').and.callFake((type) => {
			console.log(type,'x');
			if(type === 'overlays') {
				return Observable.of({
					filteredOverlays: ['first', 'last']
				});
			}
			if(type === 'cases'){
				return Observable.of({
					selected_case: caseItem,
					cases: [ caseItem ]
				});
			}
			if(type === 'tools'){
				toolsState = cloneDeep(toolsInitialState);
				return Observable.of(toolsState);
			}
			return Observable.empty();
		});
	}));

	beforeEach(inject([ CasesService, EffectsRunner, ImageryCommunicatorService, OverlaysAppEffects, OverlaysService],(_casesService:CasesService,_effectsRunner:EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService,_overalysAppEffects:OverlaysAppEffects, _overlaysService: OverlaysService) => {
		casesService = _casesService;
		overlaysAppEffects = _overalysAppEffects;
		effectsRunner = _effectsRunner;
		overlaysService = _overlaysService;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(overlaysAppEffects).toBeTruthy();
	});

	it("onOverlaysMarkupsChanged$",() => {
		spyOn(casesService,'getOverlaysMarkup').and.returnValue({});
		const action = new LoadOverlaysSuccessAction({} as any);
		effectsRunner.queue(action);
		let count = 0;
		overlaysAppEffects.onOverlaysMarkupsChanged$.subscribe((_result:Action) => {
			count++;
			expect(_result.type).toEqual(OverlaysActionTypes.OVERLAYS_MARKUPS);
			expect(casesService.getOverlaysMarkup).toHaveBeenCalledTimes(1);
		});
		expect(count).toBe(1);
	});

	it('On selectCase$ call to loadOverlaysAction with case params ', () => {

		effectsRunner.queue(new SelectCaseByIdAction(caseItem.id));

		overlaysAppEffects.selectCase$.subscribe((result: LoadOverlaysAction) => {
			expect(result instanceof LoadOverlaysAction).toBeTruthy();
			expect(result.payload.to).toEqual(caseItem.state.time.to);
			expect(result.payload.from).toEqual(caseItem.state.time.from);
			expect(result.payload.polygon).toEqual(caseItem.state.region);
			expect(result.payload.caseId).toEqual(caseItem.id);
		});
	});

	it('displayLatestOverlay$ effect should have been call only if displayOverlay = "latest"', () => {
		let result;
		const drops = [{name:'name', data: [{id: 'first'}, {id: 'last'}]}];



		casesService.contextValues.defaultOverlay = 'latest';

		effectsRunner.queue(new SetFiltersAction([]));

		overlaysAppEffects.displayLatestOverlay$.subscribe((_result) => {
			result = _result;
		});

		expect(result.constructor).toEqual(DisplayOverlayFromStoreAction);
		expect(result.payload.id).toEqual('last');
	});

	it('drawFootprintsFromCommunicatorAdded$ effect should use draw overlays overlays-display-mode if added communicator has "overlayDisplayMode" Hitmap in case', () => {
		effectsRunner.queue(new AddMapInstacneAction({currentCommunicatorId: 'imagery1'}));

		const commEntitiy = {
			getVisualizer:(visType) => {}
		};
		const visEntitiy = {
			setEntities:(entities) => {},
			clearEntities:() => {}
		};

		const drops = [{id: 'id', name: 'name', footprint: {}}];
		spyOn(overlaysService, 'parseOverlayDataForFootprintDispaly').and.callFake(() => drops);

		spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
		spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);

		spyOn(visEntitiy, 'setEntities');
		spyOn(visEntitiy, 'clearEntities');

		overlaysAppEffects.drawFootprintsFromCommunicatorAdded$.subscribe();

		expect(visEntitiy.setEntities).toHaveBeenCalled();
		expect(visEntitiy.clearEntities).toHaveBeenCalled();
	});

	it('drawFootprintsFromCommunicatorAdded$ effect should NOT draw overlays overlays-display-mode if added communicator has "overlayDisplayMode" = None in case', () => {
		effectsRunner.queue(new AddMapInstacneAction({currentCommunicatorId: 'imagery2'}));

		const commEntitiy = {
			getVisualizer:(visType) => {}
		};
		const visEntitiy = {
			setEntities:(entities) => {},
			clearEntities:() => {}
		};

		const drops = [{id: 'id', name: 'name', footprint: {}}];
		spyOn(overlaysService, 'parseOverlayDataForFootprintDispaly').and.callFake(() => drops);

		spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
		spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);

		spyOn(visEntitiy, 'setEntities');
		spyOn(visEntitiy, 'clearEntities');

		overlaysAppEffects.drawFootprintsFromCommunicatorAdded$.subscribe();

		expect(visEntitiy.setEntities).not.toHaveBeenCalled();
		expect(visEntitiy.clearEntities).toHaveBeenCalledTimes(2);
	});

	it('drawFootprintsFromFilteredOverlays$ effect should draw overlays overlays-display-mode if selected case/active map has overlayDisplayMode="Hitmap"', () => {
		effectsRunner.queue(new SetFiltersAction([]));

		const commEntitiy = {
			getVisualizer:(visType) => {}
		};
		const visEntitiy = {
			setEntities:(entities) => {},
			clearEntities:() => {}
		};

		const drops = [{id: 'id', name: 'name', footprint: {}}];
		spyOn(overlaysService, 'parseOverlayDataForFootprintDispaly').and.callFake(() => drops);

		spyOn(imageryCommunicatorService, 'provide').and.returnValue(commEntitiy);
		spyOn(commEntitiy, 'getVisualizer').and.returnValue(visEntitiy);

		spyOn(visEntitiy, 'setEntities');
		spyOn(visEntitiy, 'clearEntities');

		overlaysAppEffects.drawFootprintsFromFilteredOverlays$.subscribe();

		expect(visEntitiy.setEntities).toHaveBeenCalled();
		expect(visEntitiy.clearEntities).toHaveBeenCalled();
	});
});
