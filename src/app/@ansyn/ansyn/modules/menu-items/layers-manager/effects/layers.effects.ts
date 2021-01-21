import { ILayerState } from '../reducers/layers.reducer';
import {
	AddLayer,
	BeginLayerCollectionLoadAction,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes,
	RemoveCaseLayersFromBackendAction,
	RemoveCaseLayersFromBackendSuccessAction
} from '../actions/layers.actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { DataLayersService } from '../services/data-layers.service';
import { ILayer, LayerType } from '../models/layers.model';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';

@Injectable()
export class LayersEffects {

	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.pipe(
			ofType<BeginLayerCollectionLoadAction>(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD),
			mergeMap(({ payload }) => this.dataLayersService.getAllLayersInATree(payload)),
			map((layers: ILayer[]) => new LayerCollectionLoadedAction(layers)),
			catchError(() => of(new LayerCollectionLoadedAction([])))
		);

	@Effect()
	onLayerCollectionLoaded$ = this.actions$.pipe(
		ofType<LayerCollectionLoadedAction>(LayersActionTypes.LAYER_COLLECTION_LOADED),
		mergeMap((action) => {
			const regionLayer = this.dataLayersService.generateLayer({ name: 'Region', id: 'region-layer', type: LayerType.static });
			const layers = [regionLayer];

			if (!action.payload.some(({ type }) => type === LayerType.annotation)) {
				layers.push(this.dataLayersService.generateLayer());
			}

			return layers.map(layer => new AddLayer(layer));
		})
	);

	@Effect()
	removeCaseLayers$ = this.actions$.pipe(
		ofType(LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_ACTION),
		mergeMap( (action: RemoveCaseLayersFromBackendAction) => this.dataLayersService.removeCaseLayers(action.caseId)),
		map( ([caseId, layersId]) => new RemoveCaseLayersFromBackendSuccessAction(caseId)),
		rxPreventCrash()
	);




	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
