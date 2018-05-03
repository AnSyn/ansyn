import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Layer, LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { SelectLayerAction, UnselectLayerAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';

@Component({
	selector: 'ansyn-layer-collection',
	templateUrl: './layer-collection.component.html',
	styleUrls: ['./layer-collection.component.less'],
	animations: [
		trigger('rotateArrow', [
			state('true', style({
				transform: 'rotateZ(-45deg) translateY(35%) translateX(50%)'
			})),
			state('false', style({
				transform: 'rotateZ(135deg) translateY(-75%)'
			})),
			transition('1 <=> 0', animate('0.1s'))
		]),
		trigger('layersTrigger', [
			state('true', style({
				maxHeight: '5000px',
				opacity: 1
			})),
			state('false', style({
				maxHeight: '0',
				opacity: 0
			})),
			transition('1 <=> 0', animate('0.2s'))
		])
	]
})

export class LayerCollectionComponent {
	@Input() collection: LayersContainer;
	public show = true;

	constructor(public store: Store<ILayerState>) {
	}

	public onCheckboxClicked(event, layer: Layer): void {
		if (event.target.checked) {
			this.store.dispatch(new SelectLayerAction(layer));
		} else {
			this.store.dispatch(new UnselectLayerAction(layer));
		}
	}
}
