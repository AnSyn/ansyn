import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ILayerState } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Layer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import {
	UpdateSelectedLayersToCaseAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { selectedLayersIds } from '@ansyn/menu-items/cases/reducers/cases.reducer';
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
	@Input() collection: Layer[];
	activeLayersIds = [];
	selectedLayers$: Observable<any> = this.store.select(selectedLayersIds)
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

	public onCheckboxClicked(event, layer: Layer): void {
		if (event.target.checked) {
			this.store.dispatch(new UpdateSelectedLayersToCaseAction([...this.activeLayersIds, layer.id]));
		} else {
			this.store.dispatch(new UpdateSelectedLayersToCaseAction(this.activeLayersIds.filter((id) => id !== layer.id)));
		}
	}
}
