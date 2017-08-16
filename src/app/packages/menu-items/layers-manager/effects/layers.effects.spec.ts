import { ILayerTreeNodeRoot, ILayerTreeNodeLeaf, ILayerTreeNode, LayerType } from '@ansyn/core';
import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { HttpModule } from '@angular/http';
import { StoreModule } from '@ngrx/store';
import { LayersReducer } from '../reducers/layers.reducer';
import { LayerTreeLoadedAction, SelectLeafLayerAction } from './../actions/layers.actions';
import { Observable } from 'rxjs/Observable';

describe('LayersEffects', () => {
    let layersEffects: LayersEffects;
    let effectsRunner: EffectsRunner;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({ layers: LayersReducer })],
            providers: [LayersEffects]
        }).compileComponents();
    }));

    beforeEach(inject([LayersEffects, EffectsRunner], (_layersEffects: LayersEffects, _effectsRunner: EffectsRunner) => {
        layersEffects = _layersEffects;
        effectsRunner = _effectsRunner;
    }));

    it('should be defined', () => {
        expect(layersEffects).toBeDefined();
    });

    it('beginLayerTreeLoad$ should call dataLayersService.getAllLayersInATree with case id from state, and return LayerTreeLoadedAction', () => {
        let staticLeaf: ILayerTreeNodeLeaf = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, url: "fake_url", isIndeterminate: false, children: <ILayerTreeNode[]>[], source: null };
        let staticLayer: ILayerTreeNodeRoot = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, type: LayerType.static, isIndeterminate: false, children: <ILayerTreeNode[]>[staticLeaf] };
        let dynamicLayer: ILayerTreeNodeRoot = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, type: LayerType.dynamic, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNodeRoot = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, type: LayerType.complex, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNodeRoot[] = [staticLayer, dynamicLayer, complexLayer];
        let selectedLayers: ILayerTreeNode[] = [staticLeaf];

        let loadedTreeBundle = { layers: layers, selectedLayers: selectedLayers };

        effectsRunner.queue(new LayerTreeLoadedAction({ layers }));

        layersEffects.layerTreeLoaded$.subscribe((result: LayerTreeLoadedAction) => {
            expect(result instanceof LayerTreeLoadedAction ||
                result instanceof SelectLeafLayerAction).toBeTruthy();
            
            if (result instanceof LayerTreeLoadedAction) {
                expect(result.payload).toEqual(<any>loadedTreeBundle);
            }

            if (result instanceof SelectLeafLayerAction) {
                expect(result.payload).toEqual(<any>staticLeaf);
            }
        });
    });
});
