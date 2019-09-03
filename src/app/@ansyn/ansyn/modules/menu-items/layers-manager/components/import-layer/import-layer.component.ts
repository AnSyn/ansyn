import { Component, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { DataLayersService } from '../../services/data-layers.service';
import { AddLayer } from '../../actions/layers.actions';
import * as toGeoJSON from 'togeojson';
import { fromEvent, Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { tap } from 'rxjs/operators';

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
				const readerResult: string = <string>this.reader.result;
				switch (fileType.toLowerCase()) {
					case 'kml':
						layerData = toGeoJSON.kml((new DOMParser()).parseFromString(readerResult, 'text/xml'));
						this.simpleStyleToVisualizer(layerData);
						break;
					case 'json':
					case 'geojson':
						layerData = JSON.parse(readerResult);
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
			const { id, label, showMeasures, mode, ...initial } = feature.properties;
			feature.properties = {
				id,
				label,
				showMeasures: JSON.parse(showMeasures ? showMeasures : null),
				mode,
				style: { initial }
			};
		});
	}

}
