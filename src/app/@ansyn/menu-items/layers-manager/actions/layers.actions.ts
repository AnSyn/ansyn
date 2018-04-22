import { LayerMetadata } from '../models/metadata/layer-metadata.interface';
import { Layer } from '../models/layer';
import { Action } from '@ngrx/store';
import { CaseFacetsState } from '@ansyn/core/models/case.model';
import { FeatureCollection } from "geojson";

export const LayersActionTypes = {
	INITIALIZE_LAYERS: 'INITIALIZE_LAYERS',
	INITIALIZE_LAYERS_SUCCESS: 'INITIALIZE_LAYERS_SUCCESS',

	SELECT_LAYER: 'SELECT_LAYER',
	UNSELECT_LAYER: 'UNSELECT_LAYER',
	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
	// INITIALIZE_SINGLE_LAYER: 'INITIALIZE_SINGLE_LAYER',
	// UPDATE_LAYER_METADATA: 'UPDATE_LAYER_METADATA',

	ANNOTATIONS: {
		SET_LAYER: 'SET_LAYER',
		TOGGLE_DISPLAY_LAYER: 'TOGGLE_LAYER',
	}
};

export type LayersActions = any; // not sure if needs to be specific list

export class ToggleDisplayAnnotationsLayer implements Action {
	type = LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER;

	constructor(public payload: boolean) {
	}
}

export class SetAnnotationsLayer implements Action {
	type = LayersActionTypes.ANNOTATIONS.SET_LAYER;

	constructor(public payload: FeatureCollection<any>) {
	}
}


export class InitializeLayersAction implements Action {
	type = LayersActionTypes.INITIALIZE_LAYERS;

	constructor(public payload?: { overlays: any[], facets: CaseFacetsState }) {
	}
}

export class InitializeLayersSuccessAction implements Action {
	type = LayersActionTypes.INITIALIZE_LAYERS_SUCCESS;

		constructor(public payload: {
		layers: Layer[],
		selectedLayers: Layer[]
	}) {
	}
}

// export class UpdateLayerAction implements Action {
// 	type = LayersActionTypes.UPDATE_LAYER_METADATA;
//
// 	constructor(public payload?: { layer: Layer, newMetadata: LayerMetadata }) {
// 	}
// }

export class SelectLayerAction implements Action {
	type = LayersActionTypes.SELECT_LAYER;

	constructor(public payload: Layer) {
	}
}

export class UnselectLayerAction implements Action {
	type = LayersActionTypes.UNSELECT_LAYER;

	constructor(public payload: Layer) {
	}
}

export class ErrorLoadingLayersAction implements Action {
	type = LayersActionTypes.ERROR_LOADING_LAYERS;

	constructor(public payload: string) {
	}
}

// import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
// import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
// import { Action } from '@ngrx/store';
// import { FeatureCollection } from 'geojson';
//
// export const LayersActionTypes = {
// 	BEGIN_LAYER_TREE_LOAD: 'BEGIN_LAYER_TREE_LOAD',
// 	LAYER_TREE_LOADED: 'LAYER_TREE_LOADED',
// 	SELECT_LAYER: 'SELECT_LAYER',
// 	UNSELECT_LAYER: 'UNSELECT_LAYER',
// 	ERROR_LOADING_LAYERS: 'ERROR_LOADING_LAYERS',
// 	ANNOTATIONS: {
// 		SET_LAYER: 'SET_LAYER',
// 		TOGGLE_DISPLAY_LAYER: 'TOGGLE_LAYER',
// 	}
// };
//
// export type LayersActions =
// 	| ToggleDisplayAnnotationsLayer
// 	| BeginLayerTreeLoadAction
// 	| LayerTreeLoadedAction
// 	| SelectLayerAction
// 	| UnselectLayerAction
// 	| ErrorLoadingLayersAction;
//
// export class ToggleDisplayAnnotationsLayer implements Action {
// 	type = LayersActionTypes.ANNOTATIONS.TOGGLE_DISPLAY_LAYER;
//
// 	constructor(public payload: boolean) {
// 	}
// }
//
// export class SetAnnotationsLayer implements Action {
// 	type = LayersActionTypes.ANNOTATIONS.SET_LAYER;
//
// 	constructor(public payload: FeatureCollection<any>) {
// 	}
// }
//
//
//
// export class BeginLayerTreeLoadAction implements Action {
// 	type = LayersActionTypes.BEGIN_LAYER_TREE_LOAD;
// }
//
// export class LayerTreeLoadedAction implements Action {
// 	type = LayersActionTypes.LAYER_TREE_LOADED;
//
// 	constructor(public payload: {
// 		layers: ILayerTreeNodeRoot[],
// 		selectedLayers: ILayerTreeNodeLeaf[]
// 	}) {
// 	}
// }
//
// export class SelectLayerAction implements Action {
// 	type = LayersActionTypes.SELECT_LAYER;
//
// 	constructor(public payload: ILayerTreeNodeLeaf) {
// 	}
// }
//
// export class UnselectLayerAction implements Action {
// 	type = LayersActionTypes.UNSELECT_LAYER;
//
// 	constructor(public payload: ILayerTreeNodeLeaf) {
// 	}
// }
//
// export class ErrorLoadingLayersAction implements Action {
// 	type = LayersActionTypes.ERROR_LOADING_LAYERS;
//
// 	constructor(public payload: string) {
// 	}
// }
