import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'ansyn-unsupported-devices',
	templateUrl: './unsupported-devices.component.html',
	styleUrls: ['./unsupported-devices.component.less']
})
export class UnsupportedDevicesComponent implements OnInit {
	@Input() type: string;
	TEXTS = {
		mobile: 'Currently AnSyn is not supported on mobile devices, please give us a try on your desktop',
		browser: 'AnSyn is not supported on old browsers, please give us a try on your Chrome/Safari'
	};

	constructor() {
	}

	ngOnInit() {
	}

}
