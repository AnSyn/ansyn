import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { BBOX, ImageryCommunicatorService } from '@ansyn/imagery';


@Injectable({
	providedIn: 'root'
})
export class OverlayOutOfBoundsService implements OnInit, OnDestroy {

	constructor(protected communicatorService: ImageryCommunicatorService) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	backToExtent(mapId: string, extent: BBOX): void {
		const communicator = this.communicatorService.provide(mapId);
		communicator?.ActiveMap?.fitToExtent(extent).pipe(take(1)).subscribe();
	}
}
