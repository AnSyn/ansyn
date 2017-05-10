import { ILayerTreeNode } from '../models/layer-tree-node';
import { IServerDataLayerContainer } from '../models/server-data-layer-container';
import { IServerDataLayer } from '../models/server-data-layer';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

export type LayersBundle = { layers: ILayerTreeNode[], selectedLayers: ILayerTreeNode[] };

@Injectable()
export class DataLayersService {
  private baseUrl = 'http://localhost:9001/api/v1/cases';

  private tree: ILayerTreeNode[] = [];

  constructor(private http: Http) { }

  public getAllLayersInATree(caseId: string = 'caseId'): Observable<LayersBundle> {
    return this.http.get(`${this.baseUrl}/${caseId}/layers`)
      .map((res) => this.extractData(res))
      .catch(this.handleError);
  }

  private extractData(res: Response): LayersBundle {
    let dataLayerArray: IServerDataLayerContainer[] = res.json();
    let clientTree: LayersBundle = this.serverTreeToClientTree(dataLayerArray);
    return clientTree || { layers: [], selectedLayers: [] };
  }

  private serverTreeToClientTree(serverTree: IServerDataLayerContainer[]): LayersBundle {
    let allRoots: ILayerTreeNode[] = [];
    let selectedLayers: ILayerTreeNode[] = [];

    for (let serverRoot of serverTree) {
      let rootBundle: LayersBundle = this.serverLayerContainerToLayerTreeNodes(serverRoot);
      allRoots = allRoots.concat(rootBundle.layers);
      selectedLayers = selectedLayers.concat(rootBundle.selectedLayers);
    }

    return { layers: allRoots, selectedLayers: selectedLayers };
  }

  private serverLayerContainerToLayerTreeNodes(container: IServerDataLayerContainer): LayersBundle {
    let flattenedChildren: ILayerTreeNode[] = [];
    let selectedChildrenNodes: ILayerTreeNode[] = [];

    container.dataLayerContainers.forEach(childContainer => {
      let childContainerBundle: LayersBundle = this.serverLayerContainerToLayerTreeNodes(childContainer);

      flattenedChildren = flattenedChildren.concat(childContainerBundle.layers);
      selectedChildrenNodes = selectedChildrenNodes.concat(childContainerBundle.selectedLayers);
    });

    if (container.dataLayers) {
      let dataLayersBundle: LayersBundle = this.serverDataLayersToClientLayerTreeNodes(container.dataLayers);

      flattenedChildren = flattenedChildren.concat(dataLayersBundle.layers);
      selectedChildrenNodes = selectedChildrenNodes.concat(dataLayersBundle.selectedLayers);
    }

    let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
    let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
    let isIndeterminate: boolean = !(allChecked || allUncheked);

    return {
      layers: [{ id: container.id, name: container.name, children: flattenedChildren, isChecked: allChecked, isIndeterminate: isIndeterminate }],
      selectedLayers: selectedChildrenNodes
    };
  }

  private serverDataLayersToClientLayerTreeNodes(serverDataLayers: IServerDataLayer[]): LayersBundle {
    let allLayers: ILayerTreeNode[] = [];
    let selectedLayers: ILayerTreeNode[] = [];

    for (let serverDataLayer of serverDataLayers) {
      let layerTreeNode: ILayerTreeNode = {
        id: serverDataLayer.id,
        name: serverDataLayer.name,
        children: [],
        isChecked: serverDataLayer.isChecked,
        isIndeterminate: false
      };

      allLayers.push(layerTreeNode);
      if (layerTreeNode.isChecked){
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
