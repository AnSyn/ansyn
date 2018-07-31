import { Component, EventEmitter, Input, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import * as tokml from 'tokml';
import { cloneDeep } from 'lodash';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { Store } from '@ngrx/store';
import { ILayerState } from '../../../reducers/layers.reducer';
import { CloseLayersModal } from '../../../actions/layers.actions';

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
		const blob = new Blob([JSON.stringify(annotationsLayer)], { type: 'application/geo+json' });
		saveAs(blob, 'annotations.geojson');
		this.store.dispatch(new CloseLayersModal());
	}

	downloadKml() {
		const annotationsLayer = cloneDeep(this.layer.data);
		this.visualizerToSimpleStyle(annotationsLayer);
		const blob = new Blob([tokml(annotationsLayer, { simplestyle: true })], { type: 'application/vnd.google-earth.kml+xml' });
		saveAs(blob, 'annotations.kml');
		this.store.dispatch(new CloseLayersModal());
	}

	visualizerToSimpleStyle(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			feature.properties = { id: feature.properties.id, ...feature.properties.style.initial };
		});
	}

}
