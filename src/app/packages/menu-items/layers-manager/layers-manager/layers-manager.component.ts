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
      name: 'Fields',
      id: 1,
      children: []
    };

    rootNode.children.push({ name: 'Rice Fields', id: 2, children: [{name: 'Brown Rice', id: 5, children: []},
    {name: 'Persian Rice', id: 6, children: []}] });
    rootNode.children.push({ name: 'Wheat Fields', id: 3, children: [] });
    rootNode.children.push({ name: 'Oat Fields', id: 4, children: [] });

    this.nodes = [rootNode];
  }

}