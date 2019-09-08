import { Component, Input, OnInit } from '@angular/core';
import { IEntryComponent, ImageryZoomerService } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
export class ImageryZoomerComponent implements OnInit, IEntryComponent {
	@Input() mapId;


	constructor(protected imageryZoomerService: ImageryZoomerService) {
	}

	ngOnInit() {
	}

	getType(): string {
		return '';
	}

	one2one() {
		this.imageryZoomerService.one2one(this.mapId);
	}

	zoomIn() {
		this.imageryZoomerService.zoomIn(this.mapId);
	}

	zoomOut() {
		this.imageryZoomerService.zoomOut(this.mapId);

	}
}
