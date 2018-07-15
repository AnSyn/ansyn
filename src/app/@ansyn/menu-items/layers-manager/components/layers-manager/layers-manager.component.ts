import { ILayerState, selectLayers } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ILayer, layerPluginType, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { groupBy } from 'lodash';
import { saveAs } from 'file-saver';
import { map, take } from 'rxjs/internal/operators';
import { selectAnnotationLayer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { tap } from 'rxjs/operators';
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
			map((layers) => {
				const annotations: ILayer = {
					id: LayerType.annotation,
					creationTime: new Date(),
					layerPluginType: layerPluginType.Annotations,
					name: 'Annotation',
					type: LayerType.annotation
				};
				return [annotations, ...layers];
			}),
			map((layers: ILayer[]): ILayerCollection[] => {
				const typeGroupedLayers = groupBy(layers, l => l.type);
				return Object.keys(typeGroupedLayers)
					.map((name): ILayerCollection => ({
						name,
						onDownload: name === LayerType.annotation ? this.downloadAnnotations.bind(this) : null,
						data: typeGroupedLayers[name],
						hideArrow: name === LayerType.annotation
					}));
			})
		);

	annotationsLayer$: Observable<any> = this.store.pipe(select(selectAnnotationLayer));

	constructor(protected store: Store<ILayerState>) {
	}

	downloadAnnotations() {
		this.annotationsLayer$
			.pipe(
				take(1),
				tap((annotationsLayer) => {
					const blob = new Blob([JSON.stringify(annotationsLayer)], { type: 'application/json' });
					saveAs(blob, 'annotations.json');
				})
			)
			.subscribe();
	}

}
