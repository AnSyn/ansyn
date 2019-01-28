import { Component, OnDestroy, OnInit } from '@angular/core';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { SetToastMessageAction } from '@ansyn/core';
import { DataLayersService } from '../../services/data-layers.service';
import { AddLayer } from '../../actions/layers.actions';
import * as toGeoJSON from 'togeojson';
import { fromEvent, Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';

@Component({
	selector: 'ansyn-import-layer',
	templateUrl: './import-layer.component.html',
	styleUrls: ['./import-layer.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ImportLayerComponent implements OnInit, OnDestroy {
	reader = new FileReader();
	file: File;

	@AutoSubscription
	onFileLoad$: Observable<any> = fromEvent(this.reader, 'load').pipe(
		tap(() => {
			const layerName = this.file.name.slice(0, this.file.name.lastIndexOf('.'));
			const fileType = this.file.name.slice(this.file.name.lastIndexOf('.') + 1);
			let layerData;
			try {
				switch (fileType.toLowerCase()) {
					case 'kml':
						layerData = toGeoJSON.kml((new DOMParser()).parseFromString(this.reader.result, 'text/xml'));
						this.simpleStyleToVisualizer(layerData);
						break;
					case 'json':
					case 'geojson':
						layerData = JSON.parse(this.reader.result);
						break;

					default:
						throw new Error('Can\'t read file type');
				}

				if (this.isFeatureCollection(layerData)) {
					this.generateFeaturesIds(layerData);
					const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData);
					this.store.dispatch(new AddLayer(layer));
				} else {
					throw new Error('Not a feature collection');
				}
			} catch (toastText) {
				this.store.dispatch(new SetToastMessageAction({
					showWarningIcon: true,
					toastText: toastText || 'Failed to import file'
				}));
			}
		})
	);

	constructor(private store: Store<any>, private dataLayersService: DataLayersService) {
	}

	importLayer(files: FileList) {
		this.file = files.item(0);
		this.reader.readAsText(this.file, 'UTF-8');
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	isFeatureCollection(json): boolean {
		return json && json.type === 'FeatureCollection' && Array.isArray(json.features);
	}

	generateFeaturesIds(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			feature.properties = { ...feature.properties, id: UUID.UUID() };
		});
	}

	simpleStyleToVisualizer(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			const { id, label, showLabel, showMeasures, mode, ...initial } = feature.properties;
			feature.properties = { id, label, showLabel: JSON.parse(showLabel ? showLabel : null), showMeasures: JSON.parse(showMeasures ? showMeasures : null), mode, style: { initial } };
		});
	}

}
