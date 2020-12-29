import { Component, Input, OnInit } from '@angular/core';
import { bboxFromGeoJson, ImageryCommunicatorService } from '@ansyn/imagery';
import { take } from 'rxjs/operators';
import { IEntryComponent } from '@ansyn/map-facade';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
export class OverlayOutOfBoundsComponent implements OnInit, IEntryComponent {
	@Input() mapId: string;

	constructor(protected communicatorService: ImageryCommunicatorService) {
	}

	ngOnInit(): void {
		this.backToExtent();
	}

	backToExtent(): void {
		const communicator = this.communicatorService.provide(this.mapId);
		if (communicator) {
			const extent = bboxFromGeoJson(communicator.mapSettings.data.overlay.footprint);
			communicator.ActiveMap.fitToExtent(extent).pipe(take(1)).subscribe();
		}
	}

	getType(): string {
		return '';
	}
}
