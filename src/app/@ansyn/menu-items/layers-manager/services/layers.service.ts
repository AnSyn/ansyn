import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Layer } from '../models/layer';
import { ErrorHandlerService } from '@ansyn/core';
import { HttpClient } from "@angular/common/http";
import { ILayersCollectionConfig } from "@ansyn/menu-items/layers-manager/models/layers-config";
import { Observable } from "rxjs/Observable";
import { IServerDataLayerContainerRoot } from "@ansyn/menu-items/layers-manager/models/server-data-layer-container-root";
import { IServerDataLayer } from "@ansyn/menu-items/layers-manager/models/server-data-layer";
import 'rxjs/add/observable/of';

export const layersConfig: InjectionToken<ILayersCollectionConfig> = new InjectionToken('layersConfig');

export interface LayersBundle {
	layers: Layer[],
	selectedLayers: Layer[]
}

@Injectable()
export class LayersService {
	baseUrl: string;

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService, protected http: HttpClient, @Inject(layersConfig) protected config: ILayersCollectionConfig) {
		this.baseUrl = this.config.layersByCaseIdUrl;
	}
	//
	// getLayers(): Layer[] {
	// 	return this.config.layers;
	// }

	public getLayers(): Observable<LayersBundle> {
		const urlString = `${this.baseUrl}/layers?from=0&limit=100`;
		return this.http.get(urlString)
			.map(this.extractData.bind(this))
			.catch(err => {
				return this.errorHandlerService.httpErrorHandle(err);
			});
	}

	public extractData(dataLayerArray: IServerDataLayerContainerRoot[]): LayersBundle {
		let clientCollection: LayersBundle = this.serverTreeToClientCollection(dataLayerArray);
		return clientCollection || { layers: [], selectedLayers: [] };
	}

	private serverTreeToClientCollection(serverTree: IServerDataLayerContainerRoot[]): LayersBundle {
		let allLayers: Layer[] = [];
		let selectedLayers: Layer[] = [];

		for (let serverRoot of serverTree) {
			let rootBundle: LayersBundle = this.serverDataLayersToClientLayerTreeNodes(serverRoot.dataLayers);
			allLayers = allLayers.concat(rootBundle.layers);
			selectedLayers = selectedLayers.concat(rootBundle.selectedLayers);
		}

		return { layers: allLayers, selectedLayers: selectedLayers };
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

	// private flattenChildren(container: IServerDataLayerContainer): LayersBundle {
	// 	let flattenedChildren: ILayerTreeNode[] = [];
	// 	let selectedChildrenNodes: ILayerTreeNodeLeaf[] = [];
	//
	// 	if (container.dataLayerContainers) {
	// 		container.dataLayerContainers.forEach(childContainer => {
	// 			let childContainerBundle: LayersBundle = this.serverLayerContainerToLayerTreeNodes(childContainer);
	//
	// 			flattenedChildren = flattenedChildren.concat(childContainerBundle.layers);
	// 			selectedChildrenNodes = selectedChildrenNodes.concat(childContainerBundle.selectedLayers);
	// 		});
	// 	}
	//
	// 	if (container.dataLayers) {
	// 		let dataLayersBundle: LayersBundle = this.serverDataLayersToClientLayerTreeNodes(container.dataLayers);
	//
	// 		flattenedChildren = flattenedChildren.concat(dataLayersBundle.layers);
	// 		selectedChildrenNodes = selectedChildrenNodes.concat(dataLayersBundle.selectedLayers);
	// 	}
	//
	// 	return { layers: flattenedChildren, selectedLayers: selectedChildrenNodes };
	// }

	// private serverRootContainerToClientRootContainer(container: IServerDataLayerContainerRoot): LayersBundle {
	// 	let flattenedBundle: LayersBundle = this.flattenChildren(container);
	// 	let flattenedChildren: Layer[] = flattenedBundle.layers;
	// 	let selectedChildrenNodes: Layer[] = flattenedBundle.selectedLayers;
	//
	// 	let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
	// 	let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
	// 	let isIndeterminate: boolean = !(allChecked || allUncheked);
	//
	// 	return {
	// 		layers: [{
	// 			id: container.id,
	// 			name: container.name,
	// 			isChecked: allChecked,
	// 			url:
	// 			isIndeterminate: isIndeterminate
	// 		}],
	// 		selectedLayers: selectedChildrenNodes
	// 	};
	// }

	// static buildCaseFacets(layersState: ILayersState): CaseFacetsState {
	// 	// const { showOnlyFavorites } = layersState;
	// 	const layers: CaseLayers = []; // add case layers?
	//
	// 	layersState.layers.forEach((newMetadata: LayerMetadata, layer: Layer) => {
	// 		const currentLayer: any = layers.find(({ fieldName }) => fieldName === layer.name);
	// 		const outerStateMetadata: any = newMetadata.getMetadataForOuterState();
	//
	// 		if (!currentLayer && Boolean(outerStateMetadata)) {
	// 			const [fieldName, metadata] = [layer.name, outerStateMetadata];
	// 			layers.push({ fieldName, metadata });
	// 		} else if (currentLayer && Boolean(outerStateMetadata)) {
	// 			currentLayer.metadata = outerStateMetadata;
	// 		} else if (currentLayer && !Boolean(outerStateMetadata)) {
	// 			const index = layers.indexOf(currentLayer);
	// 			layers.splice(index, 1);
	// 		}
	// 	});
	// 	return { layers };
	// }
	//
	// constructor(@Inject(layersConfig) protected config: ILayersCollectionConfig) {
	// }

}
