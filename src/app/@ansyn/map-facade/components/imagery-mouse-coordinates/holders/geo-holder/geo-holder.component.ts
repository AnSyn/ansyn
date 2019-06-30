import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'ansyn-geo-holder',
	templateUrl: './geo-holder.component.html',
	styleUrls: ['./geo-holder.component.less']
})
export class GeoHolderComponent implements OnInit {

	@Input() lat: string;
	@Input() long: string;
	@Input() height: string;
	constructor() {
	}

	ngOnInit() {
	}

}
