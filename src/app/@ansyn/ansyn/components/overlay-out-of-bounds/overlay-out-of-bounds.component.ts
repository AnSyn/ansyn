import { Component, Input } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { select, Store } from '@ngrx/store';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { filter, map, mergeMap } from 'rxjs/operators';
import { extentFromGeojson, ICaseMapState, IOverlay } from '@ansyn/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-overlay-out-of-bounds',
	templateUrl: './overlay-out-of-bounds.component.html',
	styleUrls: ['./overlay-out-of-bounds.component.less']
})
export class OverlayOutOfBoundsComponent {
	@Input() mapId: string;

	overlay$: Observable<IOverlay> = this.store.pipe(
		select(selectMapsList),
		map((mapsList: ICaseMapState[]) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.data.overlay)
	);

	backToExtent() {
		this.overlay$
			.pipe(
				mergeMap((overlay: IOverlay) => {
					const communicator = this.communicatorService.provide(this.mapId);
					const extent = extentFromGeojson(overlay.footprint);
					return communicator.ActiveMap.fitToExtent(extent);
				})
			).subscribe();
	}

	constructor(protected communicatorService: ImageryCommunicatorService, protected store: Store<any>) {
	}
}
