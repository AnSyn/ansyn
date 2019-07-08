import { Component, Input, OnInit } from '@angular/core';
import { IEntryComponent } from "@ansyn/map-facade";

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
export class ImageryZoomerComponent implements OnInit, IEntryComponent {
	@Input() mapId;

	constructor() {
	}

	ngOnInit() {
	}

	getType(): string {
		return '';
	}

}
