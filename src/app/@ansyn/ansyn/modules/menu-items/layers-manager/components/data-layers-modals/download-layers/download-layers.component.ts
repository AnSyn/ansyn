import { Component, Input } from '@angular/core';
import { saveAs } from 'file-saver';
import { cloneDeep } from 'lodash';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { CloseLayersModal } from '../../../actions/layers.actions';
import { UUID } from 'angular2-uuid';
import { ILayer } from '../../../models/layers.model';
import GeoJsonFormat from 'ol/format/GeoJSON';
import KMLFormat from 'ol/format/KML';
import { LoggerService } from '../../../../../core/services/logger.service';

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
		protected store: Store<ILayerState>,
		protected loggerService: LoggerService
	) {
		this.geoJsonFormat = new GeoJsonFormat();
		this.kmlFormat = new KMLFormat();
	}

	downloadGeojson() {
		this.loggerService.info(`Opening popup to save ${this.layer.type} layer ${this.layer.name} as Geojson file`, 'Layers', 'EXPORT_LAYER');
		// Todo: by action + effect + service, instead of in component
		const annotationsLayer = cloneDeep(this.layer.data);
		this.generateFeaturesIds(annotationsLayer);
		const blob = new Blob([JSON.stringify(annotationsLayer)], { type: 'application/geo+json' });
		saveAs(blob, `${ this.layer.name }.geojson`);
		this.store.dispatch(new CloseLayersModal());
	}

	downloadKml() {
		this.loggerService.info(`Opening popup to save ${this.layer.type} layer ${this.layer.name} as KML file`, 'Layers', 'EXPORT_LAYER');
		// Todo: by action + effect + service, instead of in component
		const annotationsLayer = cloneDeep(this.layer.data);
		this.generateFeaturesIds(annotationsLayer);
		this.visualizerToSimpleStyle(annotationsLayer);
		const features = this.geoJsonFormat.readFeatures(annotationsLayer);
		const kml = this.kmlFormat.writeFeatures(features);
		const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
		saveAs(blob, `${ this.layer.name }.kml`);
		this.store.dispatch(new CloseLayersModal());
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
