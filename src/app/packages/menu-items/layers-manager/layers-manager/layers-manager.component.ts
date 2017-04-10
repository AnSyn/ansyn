import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '@ansyn/core';
import { DataLayersService } from '@ansyn/core';

@Component({
  selector: 'app-layer-managers',
  templateUrl: './layers-manager.component.html',
  styleUrls: ['layers-manager.component.scss']
})
export class LayersManagerComponent implements OnInit {

  private nodes: ILayerTreeNode[];
  constructor(private dataLayersService: DataLayersService) {
  }

  ngOnInit() {
    this.dataLayersService.getAllLayersInATree().subscribe(tree => this.nodes = tree);
  }
};
