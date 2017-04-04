import { Injectable } from '@angular/core';
import { ILayerTreeNode } from '../models/layer-tree-node';
import { DATA_LAYERS } from './mock-tree';
@Injectable()
export class DataLayersService {
  tree: ILayerTreeNode[] = [];

  public getAllLayersInATree(): Promise<ILayerTreeNode[]> {
    return Promise.resolve(DATA_LAYERS);
  }
}
