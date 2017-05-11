import { ILayerTreeNode } from '../models/layer-tree-node';
import { LayersEffects } from './layers.effects';
import { async, inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { HttpModule } from '@angular/http';
import { DataLayersService, LayersBundle } from '../services/data-layers.service';
import { StoreModule } from '@ngrx/store';
import { LayersReducer } from '../reducers/layers.reducer';
import { BeginLayerTreeLoadAction, LayerTreeLoadedAction } from './../actions/layers.actions';
import { Observable } from 'rxjs';

describe('LayersEffects', () => {
    let layersEffects: LayersEffects;
    let dataLayersService: DataLayersService;
    let effectsRunner: EffectsRunner;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule, EffectsTestingModule, StoreModule.provideStore({ layers: LayersReducer })],
            providers: [LayersEffects, DataLayersService]
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
        let staticLayer: ILayerTreeNode = { name: 'staticLayer', id: 'staticLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let dynamicLayer: ILayerTreeNode = { name: 'dynamicLayer', id: 'dynamicLayerId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };
        let complexLayer: ILayerTreeNode = { name: 'complexLayers', id: 'complexLayersId', isChecked: false, isIndeterminate: false, children: <ILayerTreeNode[]>[] };

        let layers: ILayerTreeNode[] = [staticLayer, dynamicLayer, complexLayer];
        let selectedLayers: ILayerTreeNode[] = [staticLayer, dynamicLayer];

        let loadedTreeBundle: LayersBundle = { layers: layers, selectedLayers: selectedLayers };
        spyOn(dataLayersService, 'getAllLayersInATree').and.callFake(() => Observable.of(loadedTreeBundle));

        effectsRunner.queue(new BeginLayerTreeLoadAction({caseId: 'blabla'}));

        layersEffects.beginLayerTreeLoad$.subscribe((result: LayerTreeLoadedAction) => {
            expect(dataLayersService.getAllLayersInATree).toHaveBeenCalledWith('blabla');
            expect(result instanceof LayerTreeLoadedAction).toBeTruthy();
            expect(result.payload).toEqual(loadedTreeBundle);
        });
    });
});
