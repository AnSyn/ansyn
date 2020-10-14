import { Component, Input } from '@angular/core';
import { saveAs } from 'file-saver';
import { cloneDeep } from 'lodash';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { CloseLayersModal, LogExportLayer } from '../../../actions/layers.actions';
import { UUID } from 'angular2-uuid';
import { ILayer, LayerFileTypes } from '../../../models/layers.model';
import GeoJsonFormat from 'ol/format/GeoJSON';
import KMLFormat from 'ol/format/KML';

@Component({
	selector: 'ansyn-download-layers',
	templateUrl: './download-layers.component.html',
	styleUrls: ['./download-layers.component.less']
})
export class DownloadLayersComponent {
	@Input() layer: ILayer;
	geoJsonFormat: GeoJsonFormat;
	kmlFormat: KMLFormat;

	constructor(
		protected store: Store<ILayerState>
	) {
		this.geoJsonFormat = new GeoJsonFormat();
		this.kmlFormat = new KMLFormat();
	}

	get LayerFileTypes() {
		return LayerFileTypes
	}

	downloadLayerAs(fileType: LayerFileTypes) {
		this.store.dispatch(new LogExportLayer({ layer: this.layer, format: fileType }));
		const layerData = cloneDeep(this.layer.data);
		this.generateFeaturesIds(layerData);
		const blob = this.convertLayerDataTo(fileType, layerData);
		saveAs(blob, `${this.layer.name}.${fileType.toLowerCase()}`);
		this.store.dispatch(new CloseLayersModal());
	}

	convertLayerDataTo(fileType: LayerFileTypes, layerData: any): Blob {
		if (fileType === LayerFileTypes.GEOJSON) {
			return new Blob([JSON.stringify(layerData)], { type: 'application/geo+json' });
		} else if (fileType === LayerFileTypes.KML) {
			this.visualizerToSimpleStyle(layerData);
			const features = this.geoJsonFormat.readFeatures(layerData);
			const kml = this.kmlFormat.writeFeatures(features);
			return new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
		}
	}

	generateFeaturesIds(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			feature.properties = { ...feature.properties, id: UUID.UUID() };
		});

	}

	visualizerToSimpleStyle(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			const { style, label, ...props } = feature.properties;
			feature.properties = { style: JSON.stringify(style), label: JSON.stringify(label), ...props };
		});
	}

}
