import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-map-search-box',
	templateUrl: './map-search-box.component.html',
	styleUrls: ['./map-search-box.component.less']
})
export class MapSearchBoxComponent implements OnInit {
	@Input() mapId: string;

	constructor() {
	}

	ngOnInit() {
	}

}
