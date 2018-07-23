import { ILayerState, selectLayers } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { groupBy } from 'lodash';
import { map } from 'rxjs/internal/operators';
import { ILayerCollection } from '../layers-collection/layer-collection.component';

@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less']
})

export class LayersManagerComponent {


	public layers$: Observable<any> = this.store
		.pipe(
			select(selectLayers),
			map((layers: ILayer[]): ILayerCollection[] => {
				const typeGroupedLayers = groupBy(layers, l => l.type);
				return Object.keys(typeGroupedLayers)
					.map((type: LayerType): ILayerCollection => ({
						type,
						data: typeGroupedLayers[type]
					}));
			})
		);

	constructor(protected store: Store<ILayerState>) {
	}

}
