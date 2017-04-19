import { ILayerTreeNode } from '../models/data-layers/layer-tree-node';
import { IServerDataLayerContainer } from '../models/data-layers/server-data-layer-container';
import { IServerDataLayer } from '../models/data-layers/server-data-layer';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class DataLayersService {
  private dataLayersUrl = 'http://localhost:9001/api/v1/data-layers';

  private tree: ILayerTreeNode[] = [];

  constructor(private http: Http) { }

  public getAllLayersInATree(): Observable<ILayerTreeNode[]> {
    return this.http.get(this.dataLayersUrl)
      .map((res) => this.extractData(res))
      .catch(this.handleError);
  }

  private extractData(res: Response): ILayerTreeNode[] {
    let dataLayerArray: IServerDataLayerContainer[] = res.json();
    let clientTree: ILayerTreeNode[] = this.serverTreeToClientTree(dataLayerArray);
    return clientTree || [];
  }

  private serverTreeToClientTree(serverTree: IServerDataLayerContainer[]): ILayerTreeNode[] {
    let returnValue: ILayerTreeNode[] = [];

    for (let serverRoot of serverTree) {
      returnValue = returnValue.concat(this.serverLayerContainerToLayerTreeNodes(serverRoot));
    }

    return returnValue;
  }

  private serverLayerContainerToLayerTreeNodes(container: IServerDataLayerContainer): ILayerTreeNode[] {
    let flattenedChildren: ILayerTreeNode[] = [];

    container.dataLayerContainers.forEach(childContainer => {
      flattenedChildren = flattenedChildren.concat(this.serverLayerContainerToLayerTreeNodes(childContainer));
    });

    if (container.dataLayers) {
      flattenedChildren = flattenedChildren.concat(this.serverDataLayersToClientLayerTreeNodes(container.dataLayers));
    }

    let allChecked: boolean = flattenedChildren.every(child => child.isChecked);
    let allUncheked: boolean = flattenedChildren.every(child => !child.isChecked);
    let isIndeterminate: boolean = !(allChecked || allUncheked);

    return [{ id: container.id, name: container.name, children: flattenedChildren, isChecked: allChecked, isIndeterminate: isIndeterminate }];
  }

  private serverDataLayersToClientLayerTreeNodes(serverDataLayers: IServerDataLayer[]): ILayerTreeNode[] {
    let returnValue: ILayerTreeNode[] = [];

    for (let serverDataLayer of serverDataLayers) {
      returnValue.push({
        id: serverDataLayer.id,
        name: serverDataLayer.name,
        children: [],
        isChecked: serverDataLayer.isChecked,
        isIndeterminate: false
      });
    }
    return returnValue;
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
