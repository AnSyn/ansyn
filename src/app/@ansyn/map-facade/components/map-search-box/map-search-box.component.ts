import { Component, Input, OnInit } from '@angular/core';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
export class MapSearchBoxComponent implements OnInit {
	@Input() mapId: string;

	searchString: string;
	communicator: CommunicatorEntity;

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService) {
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
		this.reset();
	}

}
