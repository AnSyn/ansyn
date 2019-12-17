import { Component, OnDestroy, OnInit } from '@angular/core';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { DataLayersService } from '../../services/data-layers.service';
import { AddLayer } from '../../actions/layers.actions';
import { fromEvent, Observable } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { SetToastMessageAction } from '@ansyn/map-facade';
import { tap } from 'rxjs/operators';
import { FeatureCollection } from 'geojson';
import KmlFormat from 'ol/format/KML';
import GeoJSONFormat from 'ol/format/GeoJSON';
import { getErrorMessageFromException } from '../../../../core/utils/logs/timer-logs';

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
	kmlFormat = new KmlFormat();
	geoJsonFormat = new GeoJSONFormat();
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
						const features = this.kmlFormat.readFeatures(readerResult);
						layerData = JSON.parse(this.geoJsonFormat.writeFeatures(features));
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
			} catch (error) {
				this.store.dispatch(new SetToastMessageAction({
					showWarningIcon: true,
					toastText: getErrorMessageFromException(error, 'Failed to import file')
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
			const { id, showMeasures, mode, icon, labelSize, undeletable, label, style, isNonEditable } = feature.properties;
			feature.properties = {
				id,
				label: this.extractLabel(label),
				showMeasures: JSON.parse(showMeasures ? showMeasures : null),
				mode,
				editMode: false,
				icon,
				labelSize: isNaN(labelSize) ? 28 : parseInt(labelSize, 10),
				undeletable: JSON.parse(undeletable),
				style: JSON.parse(style),
				isNonEditable: JSON.parse(isNonEditable || false)
			};
		});
	}

	extractLabel(label: string): {text: string, geometry: any} {
		let newLabel = {text: '', geometry: null};
		try {
			newLabel = JSON.parse(label);
		}catch (e) {
			newLabel.text = label;
		}finally {
			return newLabel;
		}
	}

}
