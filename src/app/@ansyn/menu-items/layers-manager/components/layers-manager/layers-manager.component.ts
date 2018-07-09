import {
	ILayerState,
	selectDisplayAnnotationsLayer,
	selectLayers
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { ILayer, layerPluginType, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { groupBy } from 'lodash';
import { saveAs } from 'file-saver';
import { map } from 'rxjs/internal/operators';
import { selectAnnotationLayer } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { tap } from 'rxjs/operators';
import { ILayerCollection } from '../layers-collection/layer-collection.component';


@Component({
	selector: 'ansyn-layer-managers',
	templateUrl: './layers-manager.component.html',
	styleUrls: ['./layers-manager.component.less']
})

export class LayersManagerComponent implements OnInit, OnDestroy {
	annotationLayerChecked;
	annotationsLayer;
	subscriptions = [];

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
				return [annotations, ...layers]
			}),
			map((layers: ILayer[]): ILayerCollection[] => {
				const typeGroupedLayers = groupBy(layers, l => l.type);
				return Object.keys(typeGroupedLayers)
					.map((name): ILayerCollection => ({
						name,
						onDownload: name === LayerType.annotation ? this.downloadAnnotations.bind(this) : null,
						data: typeGroupedLayers[name],
						hideArrow: name === LayerType.annotation
					}))
			})
		);

	annotationsLayer$: Observable<any> = this.store
		.pipe(
			select(selectAnnotationLayer),
			tap((annotationsLayer) => this.annotationsLayer = annotationsLayer)
		);

	displayAnnotationsLayer$ = this.store
		.pipe(
			select(selectDisplayAnnotationsLayer),
			tap(result => this.annotationLayerChecked = result)
		);

	constructor(protected store: Store<ILayerState>) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.layers$.subscribe(),
			this.annotationsLayer$.subscribe(),
			this.displayAnnotationsLayer$.subscribe()
		);
	}

	ngOnDestroy() {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
	}

	downloadAnnotations() {
		const blob = new Blob([JSON.stringify(this.annotationsLayer)], { type: 'application/json' });
		saveAs(blob, 'annotations.json');
	}

}
