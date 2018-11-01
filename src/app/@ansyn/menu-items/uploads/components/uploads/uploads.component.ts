import { Component, Inject, OnInit } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
export class UploadsComponent implements OnInit {
	title = '';
	licence = false;
	sensorType: string = this.config.sensorTypes[0];

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig) {
	}

	ngOnInit() {
	}

}
