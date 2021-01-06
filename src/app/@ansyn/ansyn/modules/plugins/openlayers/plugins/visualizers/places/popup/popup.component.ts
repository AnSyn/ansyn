import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'ansyn-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.less'],
})
export class PopupComponent implements OnInit {
	name: string;
	type: string;
	constructor() {
	}

	ngOnInit(): void {
	}

}
