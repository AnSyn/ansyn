import { MapSourceProviderContainerService ,BaseSourceProvider} from '@ansyn/map-source-provider';
import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerTreeNodeLeaf } from '@ansyn/menu-items/layers-manager/models/layer-tree-node-leaf';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { async, inject, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { CasesReducer } from '@ansyn/menu-items/cases';
import { Store, StoreModule } from '@ngrx/store';
import { MapAppEffects } from './map.app.effects';
import { ImageryCommunicatorService, ConfigurationToken } from "@ansyn/imagery";
import { Observable } from 'rxjs/Observable';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { configuration } from "configuration/configuration";

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

import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

describe('MapAppEffects', () => {
	let mapAppEffects: MapAppEffects;
	let effectsRunner: EffectsRunner;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	let icase_state: ICasesState;
	let imageryCommunicatorServiceMock = {
		provideCommunicator() { }
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({ cases: CasesReducer })],
			providers: [
				MapAppEffects,
				MapSourceProviderContainerService,
				{ provide: ConfigurationToken, useValue: configuration.ImageryConfig },
				{ provide: BaseSourceProvider , useClass: SourceProviderMock1, multi:true},
				{
					provide: ImageryCommunicatorService,
					useValue: imageryCommunicatorServiceMock
				},
				{
					provide: CasesService,
					useValue: {updateCase: () => null}
				}
			]

		}).compileComponents();
	}));


	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const cases = [{
			id: 'case1',
			state: {
				maps: [{
					position: {
						center: "",
						zoom: 1
					}
				}]
			}
		}];

		icase_state = {
			cases,
			selected_case: cases[0]
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
		spyOn(imageryCommunicatorService, 'provideCommunicator').and.callFake(() => imagery1);
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
		spyOn(imageryCommunicatorService, 'provideCommunicator').and.callFake(() => imagery1);
		spyOn(imagery1, 'removeVectorLayer');

		mapAppEffects.removeVectorLayer$.subscribe(() => {
			expect(imagery1.removeVectorLayer).toHaveBeenCalledWith(staticLeaf);
		});
	});
});
