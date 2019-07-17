import { Component, Input, OnInit } from '@angular/core';
import { IEntryComponent } from "@ansyn/map-facade";
import { ImageryZoomerService } from "@ansyn/map-facade";

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
export class ImageryZoomerComponent implements OnInit, IEntryComponent {
	@Input() mapId;


	constructor(protected imageryZoomerService: ImageryZoomerService ) {
	}

	ngOnInit() {
	}

	getType(): string {
		return '';
	}

	resetZoom() {
		this.imageryZoomerService.resetZoom(this.mapId);
	}

	zoomIn() {
		this.imageryZoomerService.zoomIn(this.mapId);
	}

	zoomOut() {
		this.imageryZoomerService.zoomOut(this.mapId);

	}
}
