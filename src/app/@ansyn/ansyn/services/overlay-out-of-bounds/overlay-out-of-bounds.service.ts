import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { take } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { selectActiveMapId } from "@ansyn/map-facade";
import { bboxFromGeoJson, ImageryCommunicatorService } from "@ansyn/imagery";


@Injectable({
	providedIn: 'root'
})
export class OverlayOutOfBoundsService implements OnInit, OnDestroy {

	constructor(protected store$: Store, protected communicatorService: ImageryCommunicatorService) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
	}

	backToExtent(): void {
		this.store$.select(selectActiveMapId).pipe(take(1)).subscribe(activeMapId => {
			const communicator = this.communicatorService.provide(activeMapId);
			const extent = bboxFromGeoJson(communicator.mapSettings.data.overlay.footprint);
			communicator.ActiveMap.fitToExtent(extent).pipe(take(1)).subscribe();
		});
	}
}
