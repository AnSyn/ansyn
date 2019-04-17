import { Component, Input } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { take } from 'rxjs/operators';
import { extentFromGeojson, IEntryComponent } from '@ansyn/map-facade';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
export class OverlayOutOfBoundsComponent implements IEntryComponent {
	@Input() mapState: ICaseMapState;

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
