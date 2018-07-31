import { Component, EventEmitter } from '@angular/core';
import { tap } from 'rxjs/internal/operators';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { Store } from '@ngrx/store';
import { SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { DataLayersService } from '../../services/data-layers.service';
import { AddLayer } from '../../actions/layers.actions';
import * as toGeoJSON from 'togeojson';

@Component({
	selector: 'ansyn-import-layer',
	templateUrl: './import-layer.component.html',
	styleUrls: ['./import-layer.component.less']
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class ImportLayerComponent {
	reader: FileReader;
	fileLoad$ = new EventEmitter<void>();
	file: File;

	@AutoSubscription
	onFileLoad$ = this.fileLoad$.pipe(
		tap(() => {
			const layerName = this.file.name.slice(0, this.file.name.lastIndexOf('.'));
			const fileType = this.file.name.slice(this.file.name.lastIndexOf('.') + 1);
			let layerData;

			switch (fileType) {
				case 'kml':
					layerData = toGeoJSON.kml((new DOMParser()).parseFromString(this.reader.result, 'text/xml'));
					this.simpleStyleToVisualizer(layerData);
					break;

				case 'geojson':
					layerData = JSON.parse(this.reader.result);
					break;

				default:
					this.store.dispatch(new SetToastMessageAction({ showWarningIcon: true, toastText: 'Can\'t read file type' }))
			}

			if (layerData) {
				const layer = this.dataLayersService.generateAnnotationLayer(layerName, layerData);
				this.store.dispatch(new AddLayer(layer));
			}
		})
	);

	constructor(private store: Store<any>, private dataLayersService: DataLayersService) {
		this.reader = new FileReader();
		this.reader.onload = () => this.fileLoad$.emit();
	}

	importLayer(files: FileList) {
		this.file = files.item(0);
		this.reader.readAsText(this.file, 'UTF-8')
	}

	simpleStyleToVisualizer(annotationsLayer): void {
		/* reference */
		annotationsLayer.features.forEach((feature) => {
			const { id, ...initial } = feature.properties;
			feature.properties = { id, style: { initial } };
		});
	}

}
