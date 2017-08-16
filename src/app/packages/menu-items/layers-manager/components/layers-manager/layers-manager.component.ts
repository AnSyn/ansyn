import { SelectLeafLayerAction, UnselectLeafLayerAction } from './../../actions/layers.actions';
import { NodeActivationChangedEventArgs } from './../../event-args/node-activation-changed-event-args';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component } from '@angular/core';
import { TreeNode } from 'angular-tree-component';
import { ILayerTreeNode } from '@ansyn/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ansyn-layer-managers',
  templateUrl: './layers-manager.component.html',
  styleUrls: ['./layers-manager.component.less']
})
export class LayersManagerComponent {

  public nodes: Observable<ILayerTreeNode[]> = this.store.select("layers").map((state: ILayerState) => {
    
    return state.layers;
  });

  constructor(private store: Store<ILayerState>) { }

  public onNodeActivationChanged(args: NodeActivationChangedEventArgs){
    if (args.newState){
      this.store.dispatch(new SelectLeafLayerAction(args.node));
    }
    else {
      this.store.dispatch(new UnselectLeafLayerAction(args.node));
    }
  }

};
