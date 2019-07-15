import { Component, Input, OnInit } from '@angular/core';
import { IEntryComponent } from "@ansyn/map-facade";
import { BaseImageryMap, CommunicatorEntity, ImageryCommunicatorService } from "@ansyn/imagery";

@Component({
	selector: 'ansyn-imagery-zoomer',
	templateUrl: './imagery-zoomer.component.html',
	styleUrls: ['./imagery-zoomer.component.less']
})
export class ImageryZoomerComponent implements OnInit, IEntryComponent {
	@Input() mapId;


	constructor(protected imageryCommunicatorService: ImageryCommunicatorService ) {
	}

	ngOnInit() {
	}

	getType(): string {
		return '';
	}

	resetZoom() {
		const map = this.imageryCommunicatorService.provide(this.mapId).ActiveMap;
		map.setResolution(1);
	}

	zoomIn() {
		const map = this.imageryCommunicatorService.provide(this.mapId).ActiveMap;
		const zoom = map.getResolution();
		map.setResolution(zoom * 0.8);
	}

	zoomOut() {
		const map = this.imageryCommunicatorService.provide(this.mapId).ActiveMap;
		const zoom = map.getResolution();
		map.setResolution(zoom * 1.2);
	}
}
