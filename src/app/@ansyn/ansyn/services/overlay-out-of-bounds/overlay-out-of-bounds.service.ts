import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { bboxFromGeoJson, ImageryCommunicatorService } from "@ansyn/imagery";
import { take } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { selectActiveMapId } from "@ansyn/map-facade";

@Injectable({
	providedIn: 'root'
})
export class OverlayOutOfBoundsService implements OnInit, OnDestroy{

	constructor(protected store$: Store, protected communicatorService: ImageryCommunicatorService) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	backToExtent(): void {
		this.store$.select(selectActiveMapId).pipe(take(1)).subscribe(activeMapId => {
			const communicator = this.communicatorService.provide(activeMapId);
			if (communicator) {
				const extent = bboxFromGeoJson(communicator.mapSettings.data.overlay.footprint);
				communicator.ActiveMap.fitToExtent(extent).pipe(take(1)).subscribe();
			}
		});
	}
}
