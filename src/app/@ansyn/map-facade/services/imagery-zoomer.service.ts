import { Injectable } from '@angular/core';
import { BaseImageryMap, ImageryCommunicatorService } from "@ansyn/imagery";

@Injectable({
	providedIn: 'root'
})
export class ImageryZoomerService {

	constructor(protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	getMap(mapId: string): BaseImageryMap {
		return this.imageryCommunicatorService.provide(mapId).ActiveMap
	}

	resetZoom(mapId: string): void {
		this.getMap(mapId).setResolution(1);
	}

	zoomIn(mapId: string): void {
		const zoom = this.getMap(mapId).getResolution();
		this.getMap(mapId).setResolution(zoom * 0.8);
	}


	zoomOut(mapId: string): void {
		const zoom = this.getMap(mapId).getResolution();
		this.getMap(mapId).setResolution(zoom * 1.2);
	}
}
