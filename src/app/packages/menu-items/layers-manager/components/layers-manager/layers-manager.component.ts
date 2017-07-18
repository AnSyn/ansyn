import { SelectLayerAction, UnselectLayerAction } from './../../actions/layers.actions';
import { NodeActivationChangedEventArgs } from './../../event-args/node-activation-changed-event-args';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component } from '@angular/core';
import { TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '../../models/layer-tree-node';
import { DataLayersService } from './../../services/data-layers.service';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-layer-managers',
  templateUrl: './layers-manager.component.html',
  styleUrls: ['./layers-manager.component.less']
})
export class LayersManagerComponent {

  public nodes: Observable<ILayerTreeNode[]> = this.store.select("layers").map((state: ILayerState) => state.layers);

  constructor(private store: Store<ILayerState>) { }

  public onNodeActivationChanged(args: NodeActivationChangedEventArgs){
    if (args.newState){
      this.store.dispatch(new SelectLayerAction(args.node));
    }
    else {
      this.store.dispatch(new UnselectLayerAction(args.node));
    }
  }

};
