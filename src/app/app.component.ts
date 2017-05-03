import { Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import { StoreService } from '@ansyn/core';
import { ImageryCommunicatorService } from './packages/imagery/api/imageryCommunicatorService';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {

	constructor(public store: StoreService, public imageryCommunicatorService: ImageryCommunicatorService) {
		setTimeout(() => {
			const geoPoint: GeoJSON.Point = {
				type: 'Point',
				coordinates: [15.7, 37.9]
			};
			this.imageryCommunicatorService.getImageryCommunicator('imagery1').setCenter(geoPoint);
		}, 2000);
	}
}
