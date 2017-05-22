import { Component, Input, OnInit } from '@angular/core';
import { ImageryComponentSettings } from '@ansyn/imagery';

@Component({
	selector: 'ansyn-imagery-container',
	templateUrl: './imagery-container.component.html',
	styleUrls: ['./imagery-container.component.less']
})
export class ImageryContainerComponent implements OnInit {
	@Input() mapComponentSettings: ImageryComponentSettings;
	@Input() active: boolean;

	constructor() { }

	ngOnInit() {
	}

}
