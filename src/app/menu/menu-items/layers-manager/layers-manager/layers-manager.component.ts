import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '../models/layer-tree-node';
@Component({
  selector: 'app-layer-managers',
  templateUrl: './layers-manager.component.html',
  styleUrls: ['layers-manager.component.scss']
})
export class LayersManagerComponent implements OnInit {

  private nodes: ILayerTreeNode[];
  constructor() { }

  ngOnInit() {

    let rootNode: ILayerTreeNode = {
      parent: null,
      name: 'Fields',
      id: 0,
      children: []
    };

    rootNode.children.push({ parent: rootNode, name: 'Rice Fields', id: 1, children: [] });
    rootNode.children.push({ parent: rootNode, name: 'Wheat Fields', id: 2, children: [] });
    rootNode.children.push({ parent: rootNode, name: 'Oat Fields', id: 3, children: [] });

    this.nodes = [rootNode];
  }

}