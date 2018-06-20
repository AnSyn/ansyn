import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import {
	UpdateSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Observable } from 'rxjs/Observable';

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

export class LayerCollectionComponent implements OnInit {
	@Input() collection: ILayer[];
	activeLayersIds = [];
	selectedLayers$: Observable<any> = this.store.select(selectSelectedLayersIds)
		.distinctUntilChanged()
		.do((selectedLayers) => {
			this.activeLayersIds = selectedLayers;
		});

	public show = true;
	subscribers = [];


	ngOnInit() {
		this.subscribers.push(
			this.selectedLayers$.subscribe()
		);
	}

	constructor(public store: Store<ILayerState>) {
	}

	public onCheckboxClicked(event, layer: ILayer): void {
		if (event.target.checked) {
			this.store.dispatch(new UpdateSelectedLayersIds([...this.activeLayersIds, layer.id]));
		} else {
			this.store.dispatch(new UpdateSelectedLayersIds(this.activeLayersIds.filter((id) => id !== layer.id)));
		}
	}
}
