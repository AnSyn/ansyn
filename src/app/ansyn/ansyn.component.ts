import { Component, OnInit } from '@angular/core';
import { MapSettings } from '../packages/imagery/imageryComponent/mapSettings';
import { ImageryComponentSettings } from '../packages/imagery/imageryComponent/imageryComponentSettings';

@Component({
	selector: 'ansyn-ansyn',
	templateUrl: './ansyn.component.html',
	styleUrls: ['./ansyn.component.scss']
})
export class AnsynComponent {

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
