import { ILayersManagerConfig } from '../models/layers-manager-config';
import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { ILayerTreeNodeRoot } from '../models/layer-tree-node-root';
import { IServerDataLayerContainerRoot } from '../models/server-data-layer-container-root';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { IServerDataLayerContainer } from '../models/server-data-layer-container';
import { IServerDataLayer } from '../models/server-data-layer';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { StorageService } from "@ansyn/core/services/storage/storage.service";
import { ErrorHandlerService } from '@ansyn/core/services/error-handler.service';

export const layersConfig: InjectionToken<ILayersManagerConfig> = new InjectionToken('layers-config');

export interface LayerRootsBundle {
	layers: ILayerTreeNodeRoot[],
	selectedLayers: ILayerTreeNodeLeaf[]
}

interface LayerNodesBundle {
	layers: ILayerTreeNode[],
	selectedLayers: ILayerTreeNodeLeaf[]
}

export interface Layer{
	url: string;
	name: string;
	id: string;
	isChecked: boolean;
	isIndeterminate: boolean;
}

export interface LayersBundle{
	layers: Layer[],
	selectedLayers: Layer[]
}

@Injectable()
export class DataLayersService {

	tree: ILayerTreeNode[] = [];

	constructor(@Inject(ErrorHandlerService) public errorHandlerService: ErrorHandlerService,
				protected storageService: StorageService,
				@Inject(layersConfig) public config: ILayersManagerConfig) {
	}

	public getAllLayersInATree(): Observable<LayersBundle> {
		return this.storageService.getPage(this.config.schema, 0, 100)
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
// 		return this.storageService.getPage(this.config.schema, 0, 100)
// 			.map(this.extractData.bind(this))
// 			.catch(err => {

// 				return this.errorHandlerService.httpErrorHandle(err);
// 			});
// 	}
//
// 	public extractData(dataLayerArray: IServerDataLayerContainerRoot[]): LayerRootsBundle {
// 		let clientTree: LayerRootsBundle = this.serverTreeToClientTree(dataLayerArray);
// 		return clientTree || { layers: [], selectedLayers: [] };
// 	}
//
// 	private serverTreeToClientTree(serverTree: IServerDataLayerContainerRoot[]): LayerRootsBundle {
// 		let allRoots: ILayerTreeNodeRoot[] = [];
// 		let selectedLayers: ILayerTreeNodeLeaf[] = [];
//
// 		for (let serverRoot of serverTree) {
// 			let rootBundle: LayerRootsBundle = this.serverRootContainerToClientRootContainer(serverRoot);
// 			allRoots = allRoots.concat(rootBundle.layers);
// 			selectedLayers = selectedLayers.concat(rootBundle.selectedLayers);
// 		}
//
//
// 		return { layers: allRoots, selectedLayers: selectedLayers };
// 	}
//
// 	private serverRootContainerToClientRootContainer(container: IServerDataLayerContainerRoot): LayerRootsBundle {
// 		let flattenedBundle: LayerNodesBundle = this.flattenChildren(container);
// 		let flattenedChildren: ILayerTreeNode[] = flattenedBundle.layers;
// 		let selectedChildrenNodes: ILayerTreeNodeLeaf[] = flattenedBundle.selectedLayers;
//
// 		let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
// 		let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
// 		let isIndeterminate: boolean = !(allChecked || allUncheked);
//
// 		return {
// 			layers: [{
// 				id: container.id,
// 				name: container.name,
// 				type: container.type,
// 				children: flattenedChildren,
// 				isChecked: allChecked,
// 				isIndeterminate: isIndeterminate
// 			}],
// 			selectedLayers: selectedChildrenNodes
// 		};
// 	}
//
// 	private serverLayerContainerToLayerTreeNodes(container: IServerDataLayerContainer): LayerNodesBundle {
// 		let flattenedBundle: LayerNodesBundle = this.flattenChildren(container);
// 		let flattenedChildren: ILayerTreeNode[] = flattenedBundle.layers;
// 		let selectedChildrenNodes: ILayerTreeNodeLeaf[] = flattenedBundle.selectedLayers;
//
// 		let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
// 		let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
// 		let isIndeterminate: boolean = !(allChecked || allUncheked);
//
// 		return {
// 			layers: [{
// 				id: container.id,
// 				name: container.name,
// 				children: flattenedChildren,
// 				isChecked: allChecked,
// 				isIndeterminate: isIndeterminate
// 			}],
// 			selectedLayers: selectedChildrenNodes
// 		};
// 	}
//
// 	private flattenChildren(container: IServerDataLayerContainer): LayerNodesBundle {
// 		let flattenedChildren: ILayerTreeNode[] = [];
// 		let selectedChildrenNodes: ILayerTreeNodeLeaf[] = [];
//
// 		if (container.dataLayerContainers) {
// 			container.dataLayerContainers.forEach(childContainer => {
// 				let childContainerBundle: LayerNodesBundle = this.serverLayerContainerToLayerTreeNodes(childContainer);
//
// 				flattenedChildren = flattenedChildren.concat(childContainerBundle.layers);
// 				selectedChildrenNodes = selectedChildrenNodes.concat(childContainerBundle.selectedLayers);
// 			});
// 		}
//
// 		if (container.dataLayers) {
// 			let dataLayersBundle: LayerNodesBundle = this.serverDataLayersToClientLayerTreeNodes(container.dataLayers);
//
// 			flattenedChildren = flattenedChildren.concat(dataLayersBundle.layers);
// 			selectedChildrenNodes = selectedChildrenNodes.concat(dataLayersBundle.selectedLayers);
// 		}
//
// 		return { layers: flattenedChildren, selectedLayers: selectedChildrenNodes };
// 	}
//
// 	public getAllLayersInATree(): Observable<LayerRootsBundle> {
}
