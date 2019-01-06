import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point } from 'geojson';

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

}
