import { Component, Input, OnInit } from '@angular/core';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { GeocoderService } from '@ansyn/core/services/geocoder.service';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
export class MapSearchBoxComponent implements OnInit {
	@Input() mapId: string;

	searchString: string;
	communicator: CommunicatorEntity;

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService,
				protected geocoderService: GeocoderService) {
		this.reset();
	}

	ngOnInit() {
		this.communicator = this.imageryCommunicatorService.provide(this.mapId);
	}

	reset() {
		this.searchString = '';
	}

	onSubmit() {
		console.log(this.searchString);
		this.geocoderService.getLocation$(this.searchString)
			// .do(x => console.log(x))
			// .map(res => res.json().results)
			.do(x => console.log(x));
		this.reset();
	}

}
