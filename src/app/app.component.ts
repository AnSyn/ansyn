import { Component } from '@angular/core';
import { ImageryComponentSettings } from '@ansyn/imagery/imageryComponent/imageryComponentSettings';
import { MapSettings } from '@ansyn/imagery/imageryComponent/mapSettings';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {

	public imageryComponentSettings: ImageryComponentSettings;

	constructor() {
		this.getMapSettings();
	}

	private getMapSettings() {
		const geoPoint: GeoJSON.Point = {
			type: 'Point',
			coordinates: [16, 38]
		};

		const mapSettings: MapSettings[] = [{ mapType: 'openLayerMap', mapModes: []}, { mapType: 'cesiumMap', mapModes: []}];
		this.imageryComponentSettings = {mapCenter: geoPoint, mapComponentId: 'imagery1', mapSettings: mapSettings};
	}
}
