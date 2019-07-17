import { Component, Input, OnInit } from '@angular/core';
import { IEntryComponent } from "@ansyn/map-facade";
import { BaseImageryMap, CommunicatorEntity, ImageryCommunicatorService } from "@ansyn/imagery";
import { ImageryZoomerService } from "../../../../../map-facade/services/imagery-zoomer.service";

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
export class ImageryZoomerComponent implements OnInit, IEntryComponent {
	@Input() mapId;


	constructor(protected imageryZoomer: ImageryZoomerService ) {
	}

	ngOnInit() {
	}

	getType(): string {
		return '';
	}

	resetZoom() {
		this.imageryZoomer.resetZoom(this.mapId);
	}

	zoomIn() {
		this.imageryZoomer.zoomIn(this.mapId);
	}

	zoomOut() {
		this.imageryZoomer.zoomOut(this.mapId);

	}
}
