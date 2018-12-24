import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-upload-progress-bar',
	templateUrl: './upload-progress-bar.component.html',
	styleUrls: ['./upload-progress-bar.component.less']
})
export class UploadProgressBarComponent implements OnInit {
	@Input() name: string;
	@Input() value: number;

	constructor() {
	}

	ngOnInit() {
	}

}
