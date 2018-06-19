import { ILayerState, selectLayers } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { layersStateSelector } from '../../reducers/layers.reducer';
import { Layer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { ToggleDisplayAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { groupBy } from 'lodash';


@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less']
})

export class LayersManagerComponent implements OnInit {
	annotationLayerChecked;

	public layers$: Observable<any> = this.store.select(selectLayers)
		.map((layers: Layer[]) => {
			const typeGroupedLayers = groupBy(layers, l => l.type);
			return Object.keys(typeGroupedLayers).map(layer => typeGroupedLayers[layer]);
		});

	constructor(protected store: Store<ILayerState>) {
	}

	ngOnInit() {
		this.store.select<ILayerState>(layersStateSelector)
			.pluck<ILayerState, boolean>('displayAnnotationsLayer')
			.subscribe(result => {
				this.annotationLayerChecked = result;
			});
		this.layers$.subscribe();
	}

	annotationLayerClick() {
		this.store.dispatch(new ToggleDisplayAnnotationsLayer(!this.annotationLayerChecked));
	}

}
