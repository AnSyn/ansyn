import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '@ansyn/core';
import { DataLayersService } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-layer-managers',
  templateUrl: './layers-manager.component.html',
  styleUrls: ['layers-manager.component.scss']
})
export class LayersManagerComponent implements OnInit {

  private nodes: Observable<ILayerTreeNode[]>;
  constructor(private dataLayersService: DataLayersService) {
  }

  ngOnInit() {
    this.nodes = this.dataLayersService.getAllLayersInATree();
  }
};
