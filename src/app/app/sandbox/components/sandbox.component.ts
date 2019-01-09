import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point, Polygon } from 'geojson';
import { IOverlaysCriteria } from '@ansyn/core';

@Component({
	selector: 'ansyn-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
export class SandboxComponent implements OnInit {

	constructor(protected ansynApi: AnsynApi) {
	}

	ngOnInit() {
	}

	setPositionByRadius() {
		let center: Point = {
			type: 'Point',
			coordinates: [-117.914, 33.811]
		};
		this.ansynApi.setMapPositionByRadius(center, 100, true);
	}

	setPositionByRect() {
		let rect: Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[-118.02, 33.69],
					[-118.09, 33.69],
					[-118.09, 33.72],
					[-118.02, 33.72],
					[-118.02, 33.69]
				]
			]
		};
		this.ansynApi.setMapPositionByRect(rect);
	}

	setOverlayCriteria() {
		let criteria: IOverlaysCriteria = {
			region: {
				type: 'Point',
				coordinates: [-118.29, 33.60]
			}
		};
		this.ansynApi.setOverlaysCriteria(criteria);
	}

}
