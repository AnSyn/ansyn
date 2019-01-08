import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point, Polygon } from 'geojson';

@Component({
	selector: 'ansyn-sendbox',
	templateUrl: './sendbox.component.html',
	styleUrls: ['./sendbox.component.less']
})
export class SendboxComponent implements OnInit {

	constructor(protected ansynApi: AnsynApi) {
	}

	ngOnInit() {
	}

	setPositionWithRadius() {
		let center: Point = {
			type: 'Point',
			coordinates: [-117.914, 33.811]
		};
		this.ansynApi.setMapPositionByRadius(center, 100);
	}

	setPosition() {
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

}
