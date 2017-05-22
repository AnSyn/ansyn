import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-imagery-status',
	templateUrl: './imagery-status.component.html',
	styleUrls: ['./imagery-status.component.less']
})
export class ImageryStatusComponent implements OnInit {

	constructor() { }

	@Input() map_id;
	@Input() active;

	ngOnInit() {
	}

}
