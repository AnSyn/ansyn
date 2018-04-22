import { LayerMetadata } from '../models/metadata/layer-metadata.interface';
import {
	InitializeLayersSuccessAction,
	LayersActions,
	LayersActionTypes,
	SelectLayerAction,
	UnselectLayerAction
} from '../actions/layers.actions';
import { ILayersState, layersStateSelector } from '../reducers/layers.reducer';
import { LayersBundle, LayersService } from '../services/layers.service';
import { Layer } from '../models/layer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import 'rxjs/add/observable/from';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { CaseFacetsState } from '@ansyn/core/models/case.model';
import { ErrorLoadingLayersAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';

export const facetChangesActionType = [LayersActionTypes.INITIALIZE_LAYERS_SUCCESS];

@Injectable()
export class LayersEffects {

	/**
	 * @type Effect
	 * @name initializeLayers$
	 * @ofType InitializeLayersAction
	 * @dependencies layers
	 * @action InitializeLayersSuccessAction
	 */
	@Effect()
	initializeLayers$: Observable<LayersActions> = this.actions$
		.ofType(LayersActionTypes.INITIALIZE_LAYERS)
		.switchMap(() => {
			return this.layersService.getLayers();
		})
		.withLatestFrom(this.store$.select(layersStateSelector))
		.mergeMap(([layersBundle, store]: [LayersBundle, ILayersState]) => {
			let actionsArray = [];

			store.selectedLayers.forEach((selectedLayer) => {
				actionsArray.push(new UnselectLayerAction(selectedLayer));
			});

			actionsArray.push(new InitializeLayersSuccessAction({
				layers: layersBundle.layers,
				selectedLayers: layersBundle.selectedLayers
			}));

			layersBundle.selectedLayers.forEach((layer: Layer) => {
				actionsArray.push(new SelectLayerAction(layer));
			});

			return Observable.from(actionsArray);
		})
		.catch(error => {
			return Observable.of(new ErrorLoadingLayersAction(error));
		})
		.share();

	constructor(protected actions$: Actions,
				protected layersService: LayersService,
				protected store$: Store<ILayersState>) {
	}

	initializeMetadata(layer: Layer, facets: CaseFacetsState): LayerMetadata {
		// this type of Type is for the layer container - now we need data layers
		// const layerType = layer.type;

		// const resolveLayerFunction: InjectionResolverLayer = (function wrapperFunction() {
		// 	return function resolverLayeringFunction(layerMetadata: LayerMetadata[]): LayerMetadata {
		// 		return layerMetadata.find((item) => item.type === layerType);
		// 	};
		// })(); // not the right layer-type , it's about enum/slider/boolean and there's only enum

		let metaData: LayerMetadata;
		// =
		// this.genericTypeResolverService.resolveMultiInjection(LayerMetadata, false); // no need for resolveFilterFunction because there's only one type

		metaData.initializeLayer(layer);
		return metaData;
	}
}
