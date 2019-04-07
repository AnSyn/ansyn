import { Component, Input } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { take } from 'rxjs/operators';
import { extentFromGeojson } from '@ansyn/map-facade';
import { IOverlay } from '../../modules/overlays/models/overlay.model';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
export class OverlayOutOfBoundsComponent {
	@Input() mapId: string;
	@Input() overlay: IOverlay;

	backToExtent(): void {
		const communicator = this.communicatorService.provide(this.mapId);
		const extent = extentFromGeojson(this.overlay.footprint);
		communicator.ActiveMap.fitToExtent(extent)
			.pipe(take(1))
			.subscribe();
	}

	constructor(protected communicatorService: ImageryCommunicatorService) {
	}
}
