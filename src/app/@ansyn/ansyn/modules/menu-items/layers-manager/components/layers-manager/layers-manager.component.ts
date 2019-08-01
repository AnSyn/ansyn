import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { groupBy } from 'lodash';
import { map } from 'rxjs/operators';
import { ILayerCollection } from '../layers-collection/layer-collection.component';
import { ILayer, LayerType } from '../../models/layers.model';
import { ILayerState, selectLayers } from '../../reducers/layers.reducer';

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
					.sort()
					.map((type: LayerType): ILayerCollection => ({
						type,
						data: typeGroupedLayers[type]
					}));
			})
		);

	constructor(protected store: Store<ILayerState>) {
	}

}
