import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerTreeNodeLeaf } from '@ansyn/menu-items/layers-manager/models/layer-tree-node-leaf';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ICasesState, CasesReducer, UpdateCaseAction, CasesService } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { ImageryCommunicatorService, ConfigurationToken } from "@ansyn/imagery";
import { Observable } from 'rxjs/Observable';
import {  StopMapShadowAction, StartMapShadowAction, CompositeMapShadowAction, ActiveMapChangedAction } from '@ansyn/map-facade';
import { configuration } from "configuration/configuration";
import { TypeContainerService,TypeContainerModule } from '@ansyn/type-container';
import { BaseSourceProvider } from '@ansyn/imagery';
import { cloneDeep } from 'lodash';
import { ToolsActionsTypes,StartMouseShadow,StopMouseShadow } from '@ansyn/menu-items/tools';
import { AddMapInstacneAction } from '../../packages/map-facade/actions/map.actions';
import { OverlaysConfig, OverlaysService } from '../../packages/overlays/services/overlays.service';




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
	let icase_state: ICasesState;
	let casesService:CasesService;
	let imageryCommunicatorServiceMock = {
		provide() { }
	};
	let _cases = [{
			id: 'case1',
			name: "my test case",
			owner: 'tester',
			last_modified: new Date(),
			state: {
				selected_overlays_ids: [],
				selected_context_id: "",
				time: { type: "",from: new Date(), to: new Date()},
				facets: { SensorName: "", SansorType: 'SAR', Stereo: false, Resolution:12 },
				region: { feature: "", geometry:"" },
				maps: {
					layouts_index: 2,
					active_map_id: 'imagery1',
					data: [
						{
							id: 'imagery1',

							date: {
								position: {
									center: "",
									zoom: 1
								}
							},
							mapType: ""
						},
						{
							id: 'imagery2',

							date: {
								position: {
									center: "",
									zoom: 1
								}
							}
						}
					]
				}
			}
		}];


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpModule,
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer }),
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
					useValue: {updateCase: () => null,wrapUpdateCase: () => null}
				}
			]

		}).compileComponents();
	}));


	beforeEach(inject([Store,CasesService], (_store: Store<any>,_casesService:CasesService) => {
		store = _store;
		casesService = _casesService;
		icase_state = {
			_cases,
			selected_case: _cases[0]
		} as any;

		spyOn(store, 'select').and.callFake(() => {
			return Observable.of(icase_state);
		});
	}));

	beforeEach(inject([MapAppEffects, EffectsRunner, ImageryCommunicatorService], (_mapAppEffects: MapAppEffects, _effectsRunner: EffectsRunner, _imageryCommunicatorService: ImageryCommunicatorService) => {
		mapAppEffects = _mapAppEffects;
		effectsRunner = _effectsRunner;
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should be defined', () => {
		expect(mapAppEffects).toBeTruthy();
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

	it('on communicator changes return action composite map shadow',() => {
		const communicators:Array<string> = ['imagery1'];

		communicators.push('imagery2');
		const expectedResult = new CompositeMapShadowAction();
		effectsRunner.queue(new AddMapInstacneAction({
			currentCommunicatorId: 'imagery2',
			communicatorsIds: communicators
		}));

		let result = null;

		mapAppEffects.onCommunicatorChange$.subscribe(_result =>{
			result = _result;
		});

		expect(result).toEqual(expectedResult);

	});

	it('on active map changes fire update case action',() => {
		effectsRunner.queue(new ActiveMapChangedAction('imagery2'));

		let result = null;
		let _payload = null;

		mapAppEffects.onActiveMapChanges$.subscribe(_result => {
			//expect(true).toBe(false);
			expect(_result.payload.state.maps.active_map_id).toBe('imagery2');
			_payload = _result.payload;
			result = _result;

		});
		const expectedResult = new UpdateCaseAction(<any>_payload);
		expect(result).toEqual(expectedResult);



	});

	it('listen to start map shadow action',() => {
		effectsRunner.queue(new StartMouseShadow());
		let result = null;
		mapAppEffects.onStartMapShadow$.subscribe(_result => {
			result = _result;
		});
		expect(result).toEqual(new StartMapShadowAction());
	});

	it('listen to stop map shadow action',() => {
		effectsRunner.queue(new StopMouseShadow());
		let result = null;
		mapAppEffects.onEndMapShadow$.subscribe(_result => {
			result = _result;
		});
		expect(result).toEqual(new StopMapShadowAction());
	});
});
