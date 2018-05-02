import { ILayersManagerConfig } from '../models/layers-manager-config';
import { IServerDataLayerContainerRoot } from '../models/server-data-layer-container-root';
import { IServerDataLayer } from '../models/server-data-layer';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StorageService } from '@ansyn/core/services/storage/storage.service';
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';
import { LayerType } from '@ansyn/menu-items/layers-manager/models/layer-type';

export const layersConfig: InjectionToken<ILayersManagerConfig> = new InjectionToken('layers-config');

export interface Layer {
	url: string;
	name: string;
	id: string;
	isChecked: boolean;
	isIndeterminate: boolean;
}

export interface LayersContainer {
	type: LayerType,
	layerBundle: LayersBundle
}

export interface LayersBundle {
	layers: Layer[],
	selectedLayers: Layer[]
}

@Injectable()
export class DataLayersService {

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService,
				protected storageService: StorageService,
				@Inject(layersConfig) public config: ILayersManagerConfig) {
	}

	public getAllLayersInATree(): Observable<LayersContainer> {
		return this.storageService.getPage(this.config.schema, 0, 100)
			.map(this.extractData.bind(this))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	public extractData(dataLayerArray: IServerDataLayerContainerRoot[]): LayersContainer {
		let clientCollection: LayersContainer = this.serverTreeToClientCollection(dataLayerArray);
		return clientCollection || { type: null, layerBundle: { layers: [], selectedLayers: [] } };
	}

	private serverTreeToClientCollection(serverTree: IServerDataLayerContainerRoot[]): LayersContainer {
		let allLayers: Layer[] = [];
		let selectedLayers: Layer[] = [];
		let layerType: LayerType;

		for (let serverRoot of serverTree) {
			let rootBundle: LayersBundle = this.serverDataLayersToClientLayerTreeNodes(serverRoot.dataLayers);
			layerType = serverRoot.type;
			allLayers = allLayers.concat(rootBundle.layers);
			selectedLayers = selectedLayers.concat(rootBundle.selectedLayers);
		}

		return { type: layerType, layerBundle: { layers: allLayers, selectedLayers: selectedLayers } };
	}

	private serverDataLayersToClientLayerTreeNodes(serverDataLayers: IServerDataLayer[]): LayersBundle {
		let allLayers: Layer[] = [];
		let selectedLayers: Layer[] = [];

		for (let serverDataLayer of serverDataLayers) {
			let layer: Layer = {
				id: serverDataLayer.id,
				name: serverDataLayer.name,
				url: serverDataLayer.url,
				isChecked: serverDataLayer.isChecked,
				isIndeterminate: false
			};

			allLayers.push(layer);
			if (layer.isChecked) {
				selectedLayers.push(layer);
			}
		}
		return { layers: allLayers, selectedLayers: selectedLayers };
	}
}
