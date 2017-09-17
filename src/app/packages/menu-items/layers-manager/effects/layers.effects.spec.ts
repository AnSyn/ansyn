import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { LayerType } from '../models/layer-type';
import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { HttpModule } from '@angular/http';
import { DataLayersService } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerTreeLoadAction, LayerTreeLoadedAction, SelectLayerAction } from '../actions/layers.actions';
import { Observable } from 'rxjs/Observable';
import { layersConfig } from '@ansyn/menu-items/layers-manager';

describe('LayersEffects', () => {
	let layersEffects: LayersEffects;
	let dataLayersService: DataLayersService;
	let effectsRunner: EffectsRunner;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({ layers: LayersReducer })],
			providers: [LayersEffects, DataLayersService, {
				provide: layersConfig,
				useValue: { layersByCaseIdUrl: null }
			}]
		}).compileComponents();
	}));

	beforeEach(inject([LayersEffects, DataLayersService, EffectsRunner], (_layersEffects: LayersEffects, _dataLayersService: DataLayersService, _effectsRunner: EffectsRunner) => {
		layersEffects = _layersEffects;
		dataLayersService = _dataLayersService;
		effectsRunner = _effectsRunner;
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

		effectsRunner.queue(new BeginLayerTreeLoadAction({ caseId: 'blabla' }));

		layersEffects.beginLayerTreeLoad$.subscribe((result: LayerTreeLoadedAction | SelectLayerAction) => {
			expect(dataLayersService.getAllLayersInATree).toHaveBeenCalledWith('blabla');

			expect(result instanceof LayerTreeLoadedAction ||
				result instanceof SelectLayerAction).toBeTruthy();

			if (result instanceof LayerTreeLoadedAction) {
				expect(result.payload).toEqual(<any>loadedTreeBundle);
			}

			if (result instanceof SelectLayerAction) {
				expect(result.payload).toEqual(<any>staticLeaf);
			}
		});

	});
});
