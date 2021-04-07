import { ILayerState } from '../reducers/layers.reducer';
import {
	AddLayer, AddStaticLayers,
	BeginLayerCollectionLoadAction, ErrorLoadingStaticLayers,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes,
	RemoveCaseLayersFromBackendAction,
	RemoveCaseLayersFromBackendSuccessAction, SetLayerSearchPolygon
} from '../actions/layers.actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { DataLayersService } from '../services/data-layers.service';
import { ILayer, LayerType, regionLayerDefaultName, regionLayerId } from '../models/layers.model';
import { rxPreventCrash } from '../../../core/utils/rxjs/operators/rxPreventCrash';
import { TranslateService } from '@ngx-translate/core';

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
			const regionLayerName = this.translate.instant(regionLayerDefaultName);
			const regionLayer = this.dataLayersService.generateLayer({ name: regionLayerName, id: regionLayerId, type: LayerType.base });
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


	@Effect()
	onChangeLayerTypeRemovePolygon = this.actions$.pipe(
		ofType(LayersActionTypes.SET_LAYER_SEARCH_TYPE),
		map( () => new SetLayerSearchPolygon(null))
	);

	@Effect()
	loadStaticLayers$ = this.actions$.pipe(
		ofType(LayersActionTypes.LAYER_COLLECTION_LOADED, LayersActionTypes.REFRESH_STATIC_LAYERS),
		mergeMap( () => this.dataLayersService.getStaticLayers()),
		mergeMap( layers => {
			const actions: any[] = [new ErrorLoadingStaticLayers(layers.some(layer => !layer))];
			actions.push(new AddStaticLayers(this.dataLayersService.parseStaticLayers(layers)));
			return actions;
		})
	);



	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected translate: TranslateService,
				protected store$: Store<ILayerState>) {
	}
}
