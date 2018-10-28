import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
export class UploadsComponent implements OnInit {
	title: string;
	licence: boolean;

	constructor() {
	}

	ngOnInit() {
	}

}
