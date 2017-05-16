import { LayersManagerConfig } from './../models/layers-manager-config';
import { ILayerTreeNodeLeaf } from './../models/layer-tree-node-leaf';
import { ILayerTreeNodeRoot } from './../models/layer-tree-node-root';
import { IServerDataLayerContainerRoot } from './../models/server-data-layer-container-root';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { IServerDataLayerContainer } from '../models/server-data-layer-container';
import { IServerDataLayer } from '../models/server-data-layer';
import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

export const layersBaseUrl: InjectionToken<LayersManagerConfig> = new InjectionToken('layers-base-url');

export type LayerRootsBundle = { layers: ILayerTreeNodeRoot[], selectedLayers: ILayerTreeNodeLeaf[] };
type LayerNodesBundle = { layers: ILayerTreeNode[], selectedLayers: ILayerTreeNodeLeaf[] };

@Injectable()
export class DataLayersService {
  // should be in a global config
  baseUrl;

  tree: ILayerTreeNode[] = [];

  constructor(private http: Http, @Inject(layersBaseUrl) private config: LayersManagerConfig) {
    this.baseUrl = this.config.layersByCaseIdUrl;
  }

  public getAllLayersInATree(caseId: string = 'caseId'): Observable<LayerRootsBundle> {
    return this.http.get(`${this.baseUrl}/${caseId}/layers`)
      .map((res) => this.extractData(res.json()))
      .catch(this.handleError);
  }

  public extractData(dataLayerArray: IServerDataLayerContainerRoot[]): LayerRootsBundle {
    let clientTree: LayerRootsBundle = this.serverTreeToClientTree(dataLayerArray);
    return clientTree || { layers: [], selectedLayers: [] };
  }

  private serverTreeToClientTree(serverTree: IServerDataLayerContainerRoot[]): LayerRootsBundle {
    let allRoots: ILayerTreeNodeRoot[] = [];
    let selectedLayers: ILayerTreeNodeLeaf[] = [];

    for (let serverRoot of serverTree) {
      let rootBundle: LayerRootsBundle = this.serverRootContainerToClientRootContainer(serverRoot);
      allRoots = allRoots.concat(rootBundle.layers);
      selectedLayers = selectedLayers.concat(rootBundle.selectedLayers);
    }

    return { layers: allRoots, selectedLayers: selectedLayers };
  }

  private serverRootContainerToClientRootContainer(container: IServerDataLayerContainerRoot): LayerRootsBundle {
    let flattenedBundle: LayerNodesBundle = this.flattenChildren(container);
    let flattenedChildren: ILayerTreeNode[] = flattenedBundle.layers;
    let selectedChildrenNodes: ILayerTreeNodeLeaf[] = flattenedBundle.selectedLayers;

    let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
    let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
    let isIndeterminate: boolean = !(allChecked || allUncheked);

    return {
      layers: [{ id: container.id, name: container.name, type: container.type, children: flattenedChildren, isChecked: allChecked, isIndeterminate: isIndeterminate }],
      selectedLayers: selectedChildrenNodes
    };
  }

  private serverLayerContainerToLayerTreeNodes(container: IServerDataLayerContainer): LayerNodesBundle {
    let flattenedBundle: LayerNodesBundle = this.flattenChildren(container);
    let flattenedChildren: ILayerTreeNode[] = flattenedBundle.layers;
    let selectedChildrenNodes: ILayerTreeNodeLeaf[] = flattenedBundle.selectedLayers;

    let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
    let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
    let isIndeterminate: boolean = !(allChecked || allUncheked);

    return {
      layers: [{ id: container.id, name: container.name, children: flattenedChildren, isChecked: allChecked, isIndeterminate: isIndeterminate }],
      selectedLayers: selectedChildrenNodes
    };
  }

  private flattenChildren(container: IServerDataLayerContainer): LayerNodesBundle {
    let flattenedChildren: ILayerTreeNode[] = [];
    let selectedChildrenNodes: ILayerTreeNodeLeaf[] = [];

    container.dataLayerContainers.forEach(childContainer => {
      let childContainerBundle: LayerNodesBundle = this.serverLayerContainerToLayerTreeNodes(childContainer);

      flattenedChildren = flattenedChildren.concat(childContainerBundle.layers);
      selectedChildrenNodes = selectedChildrenNodes.concat(childContainerBundle.selectedLayers);
    });

    if (container.dataLayers) {
      let dataLayersBundle: LayerNodesBundle = this.serverDataLayersToClientLayerTreeNodes(container.dataLayers);

      flattenedChildren = flattenedChildren.concat(dataLayersBundle.layers);
      selectedChildrenNodes = selectedChildrenNodes.concat(dataLayersBundle.selectedLayers);
    }

    return { layers: flattenedChildren, selectedLayers: selectedChildrenNodes };
  }

  private serverDataLayersToClientLayerTreeNodes(serverDataLayers: IServerDataLayer[]): LayerNodesBundle {
    let allLayers: ILayerTreeNodeLeaf[] = [];
    let selectedLayers: ILayerTreeNodeLeaf[] = [];

    for (let serverDataLayer of serverDataLayers) {
      let layerTreeNode: ILayerTreeNodeLeaf = {
        id: serverDataLayer.id,
        name: serverDataLayer.name,
        url: serverDataLayer.url,
        children: [],
        isChecked: serverDataLayer.isChecked,
        isIndeterminate: false
      };

      allLayers.push(layerTreeNode);
      if (layerTreeNode.isChecked) {
        selectedLayers.push(layerTreeNode);
      }
    }
    return { layers: allLayers, selectedLayers: selectedLayers };
  }

  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
