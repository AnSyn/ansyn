import { Component, EventEmitter, Input, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import tokml from 'tokml';
import { cloneDeep } from 'lodash';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { CloseLayersModal } from '../../../actions/layers.actions';
import { UUID } from 'angular2-uuid';

@Component({
	selector: 'ansyn-download-layers',
	templateUrl: './download-layers.component.html',
	styleUrls: ['./download-layers.component.less']
})
export class DownloadLayersComponent {
	@Input() layer: ILayer;

	constructor(protected store: Store<ILayerState>) {
	}

	downloadGeojson() {
		const annotationsLayer = cloneDeep(this.layer.data);
		this.generateFeaturesIds(annotationsLayer);
		const blob = new Blob([JSON.stringify(annotationsLayer)], { type: 'application/geo+json' });
		saveAs(blob, `${this.layer.name}.geojson`);
		this.store.dispatch(new CloseLayersModal());
	}

	downloadKml() {
		const annotationsLayer = cloneDeep(this.layer.data);
		this.generateFeaturesIds(annotationsLayer);
		this.visualizerToSimpleStyle(annotationsLayer);
		const blob = new Blob([tokml(annotationsLayer, { simplestyle: true })], { type: 'application/vnd.google-earth.kml+xml' });
		saveAs(blob, `${this.layer.name}.kml`);
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
			feature.properties = { id: feature.properties.id, ...feature.properties.style.initial };
		});
	}

}
