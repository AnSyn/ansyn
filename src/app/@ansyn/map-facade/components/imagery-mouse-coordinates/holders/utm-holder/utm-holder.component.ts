import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'ansyn-utm-holder',
	templateUrl: './utm-holder.component.html',
	styleUrls: ['./utm-holder.component.less']
})
export class UtmHolderComponent implements OnInit {

	@Input() x: string;
	@Input() y: string;
	@Input() zone: string;
	@Input() height: string;
	constructor() {
	}

	ngOnInit() {
	}

}
