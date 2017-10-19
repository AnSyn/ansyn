import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { LayerType } from '../models/layer-type';
import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { DataLayersService } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerTreeLoadAction, LayerTreeLoadedAction, SelectLayerAction } from '../actions/layers.actions';
import { Observable } from 'rxjs/Observable';
import { layersConfig } from '@ansyn/menu-items/layers-manager';
import { HttpClientModule } from '@angular/common/http';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';

describe('LayersEffects', () => {
	let layersEffects: LayersEffects;
	let dataLayersService: DataLayersService;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({ layers: LayersReducer })
			],
			providers: [
				provideMockActions(() => actions),
				LayersEffects,
				DataLayersService, {
					provide: layersConfig,
					useValue: { layersByCaseIdUrl: null }
				}]
		}).compileComponents();
	}));

	beforeEach(inject([LayersEffects, DataLayersService], (_layersEffects: LayersEffects, _dataLayersService: DataLayersService) => {
		layersEffects = _layersEffects;
		dataLayersService = _dataLayersService;

	}));

	it('should be defined', () => {
		expect(layersEffects).toBeDefined();
	});

	it('beginLayerTreeLoad$ should call dataLayersService.getAllLayersInATree with case id from state, and return LayerTreeLoadedAction', () => {
		let staticLeaf: ILayerTreeNodeLeaf = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			url: 'fake_url',
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let staticLayer: ILayerTreeNodeRoot = {
			name: 'staticLayer',
			id: 'staticLayerId',
			isChecked: false,
			type: LayerType.static,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[staticLeaf]
		};
		let dynamicLayer: ILayerTreeNodeRoot = {
			name: 'dynamicLayer',
			id: 'dynamicLayerId',
			isChecked: false,
			type: LayerType.dynamic,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};
		let complexLayer: ILayerTreeNodeRoot = {
			name: 'complexLayers',
			id: 'complexLayersId',
			isChecked: false,
			type: LayerType.complex,
			isIndeterminate: false,
			children: <ILayerTreeNode[]>[]
		};

		let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
		let selectedLayers: ILayerTreeNode[] = [staticLeaf];

		let loadedTreeBundle = { layers: layers, selectedLayers: selectedLayers };
		spyOn(dataLayersService, 'getAllLayersInATree').and.callFake(() => Observable.of(loadedTreeBundle));
		actions = hot('--a--', { a: new BeginLayerTreeLoadAction({ caseId: 'blabla' }) });
		const expectedResults = cold('--(ab)--', {
			a: new LayerTreeLoadedAction(<any>loadedTreeBundle),
			b: new SelectLayerAction(<any>staticLeaf)
		});
		expect(layersEffects.beginLayerTreeLoad$).toBeObservable(expectedResults);

	});
});
