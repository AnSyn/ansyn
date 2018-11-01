import { Component, Inject, OnInit } from '@angular/core';
import { IUploadsConfig, UploadsConfig } from '../../config/uploads-config';

@Component({
	selector: 'ansyn-uploads',
	templateUrl: './uploads.component.html',
	styleUrls: ['./uploads.component.less']
})
export class UploadsComponent implements OnInit {
	readonly sharingOptions = ['Public', 'Private'];
	readonly sensorNames = [ ...this.config.sensorNames, 'Custom' ];
	readonly sensorTypes = this.config.sensorTypes;

	title = '';
	licence = false;
	sensorType = '';
	sensorName = '';

	constructor(@Inject(UploadsConfig) protected config: IUploadsConfig) {
	}

	ngOnInit() {
	}

}
