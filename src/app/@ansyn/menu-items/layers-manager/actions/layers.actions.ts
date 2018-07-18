import { Action } from '@ngrx/store';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';

export enum LayersActionTypes {
	BEGIN_LAYER_COLLECTION_LOAD = '[Layers] Begin layer collection load',
	LAYER_COLLECTION_LOADED = '[Layers] Layer collection loaded',
	ERROR_LOADING_LAYERS = '[Layers] Error loading layers',
	UPDATE_SELECTED_LAYERS_IDS = '[Layers] Update selected layers ids',
	SET_LAYER_SELECTION = '[Layers] Set layer selection',
	SELECT_ONLY = '[Layers] Select only',
	UPDATE_LAYER = '[Layers] Update layer',
};

export type LayersActions =
	| BeginLayerCollectionLoadAction
	| LayerCollectionLoadedAction
	| ErrorLoadingLayersAction
	| UpdateSelectedLayersIds
	| SetLayerSelection
	| SelectOnlyLayer
	| UpdateLayer;

export class BeginLayerCollectionLoadAction implements Action {
	type = LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD;
	constructor(public payload: { caseId: string }) {
	}
}

export class LayerCollectionLoadedAction implements Action {
	type = LayersActionTypes.LAYER_COLLECTION_LOADED;

	constructor(public payload: ILayer[]) {
	}
}

export class UpdateSelectedLayersIds implements Action {
	type = LayersActionTypes.UPDATE_SELECTED_LAYERS_IDS;

	constructor(public payload: string[]) {
	}
}

export class ErrorLoadingLayersAction implements Action {
	type = LayersActionTypes.ERROR_LOADING_LAYERS;

	constructor(public payload: string) {
	}
}

export class SetLayerSelection {
	readonly type = LayersActionTypes.SET_LAYER_SELECTION;
	constructor(public payload: { id: string, value: boolean }) {
	}
}

export class SelectOnlyLayer {
	readonly type = LayersActionTypes.SELECT_ONLY;
	constructor(public payload: string) {
	}
}

export class UpdateLayer {
	readonly type = LayersActionTypes.UPDATE_LAYER;
	constructor(public payload: ILayer) {
	}
}


