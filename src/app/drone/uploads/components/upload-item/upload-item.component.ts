import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
	selector: 'ansyn-upload-item',
	templateUrl: './upload-item.component.html',
	styleUrls: ['./upload-item.component.less']
})
export class UploadItemComponent implements OnInit {
	@Input() name: string;
	@Input() value: number;
	@Output() moveToUpload = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	cutName(name: string = '') {
		return name.length < 20 ? name : name.substring(0, 20) + '...';

	}
}
