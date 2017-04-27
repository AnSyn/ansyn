import { Component, ElementRef, ViewChild, OnInit} from '@angular/core';
import { StoreService } from '@ansyn/core';
import { MapCommunicator } from './packages/imagery/api/mapCommunicator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {

	public mapCommunicator: MapCommunicator = new MapCommunicator();
  	constructor(public store: StoreService) {
  		setTimeout(() => {
  			const geoPoint: GeoJSON.Point = {
  				type: 'Point',
				coordinates: [15.7, 37.9]
			};
  			this.mapCommunicator.setCenter(geoPoint);
		}, 2000);
	}
}
