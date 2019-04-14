import { Component, Input } from '@angular/core';
import { ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import { take } from 'rxjs/operators';
import { extentFromGeojson } from '@ansyn/map-facade';
import { IEntryComponent } from '../../../map-facade/directives/entry-component.directive';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
export class OverlayOutOfBoundsComponent implements IEntryComponent {
	@Input() mapState: IMapSettings;

	backToExtent(): void {
		const communicator = this.communicatorService.provide(this.mapState.id);
		const extent = extentFromGeojson(this.mapState.data.overlay.footprint);
		communicator.ActiveMap.fitToExtent(extent)
			.pipe(take(1))
			.subscribe();
	}

	constructor(protected communicatorService: ImageryCommunicatorService) {
	}
}
