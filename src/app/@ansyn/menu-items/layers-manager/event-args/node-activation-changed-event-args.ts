import { ILayerTreeNodeLeaf } from '../models/layer-tree-node-leaf';
import { Layer } from '@ansyn/menu-items/layers-manager/services/data-layers.service';

export class NodeActivationChangedEventArgs {
	public layer: Layer;
	public newState: boolean;

	constructor(layer: Layer, newState: boolean) {
		this.layer = layer;
		this.newState = newState;
	}
}
