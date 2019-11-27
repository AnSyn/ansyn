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
import { FeatureCollection } from 'geojson';
import KMLFORMAT from 'ol/format/KML';
import GEOJSONFORMAT from 'ol/format/GeoJSON';

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
						const features = new KMLFORMAT().readFeatures(readerResult);
						layerData = JSON.parse(new GEOJSONFORMAT().writeFeatures(features)); //toGeoJSON.kml((new DOMParser()).parseFromString(readerResult, 'text/xml'));
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
					const isNonEditable = this.isNonEditable(layerData);
					const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData, isNonEditable);
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

	generateFeaturesIds(featureCollection: FeatureCollection): void {
		/* reference */
		featureCollection.features.forEach((feature) => {
			feature.properties = { ...feature.properties, id: UUID.UUID() };
		});
	}

	isNonEditable(featureCollection: FeatureCollection): boolean {
		return featureCollection.features.some((feature) => feature.properties.isNonEditable);
	}

	simpleStyleToVisualizer(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			const { id, label, showMeasures, mode, editMode, icon, labelSize, undeletable, ...initial } = feature.properties;
			feature.properties = {
				id,
				label: label ? JSON.parse(label) : {text: '', geometry: null},
				showMeasures: JSON.parse(showMeasures ? showMeasures : null),
				mode,
				editMode: JSON.parse(editMode ? editMode : false),
				icon,
				labelSize,
				undeletable,
				style: { initial }
			};
		});
	}

}
