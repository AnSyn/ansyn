import { EntitiesVisualizer } from '../entities-visualizer';
import { combineLatest, Observable } from 'rxjs';
import { IMapState, MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { OverlaysService, selectDrops } from '@ansyn/overlays';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ICaseMapState, IOverlay } from '@ansyn/core';
import { mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { EMPTY } from 'rxjs/index';

export class BaseFootprintsVisualizer extends EntitiesVisualizer {

	overlayDisplayMode$: Observable<string> = this.store
		.pipe(
			select(mapStateSelector),
			map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: ICaseMapState) => map.data.overlayDisplayMode),
			distinctUntilChanged()
		);

	@AutoSubscription
	drawOverlaysOnMap$: Observable<any> = combineLatest(this.overlayDisplayMode$, this.store.select(selectDrops))
		.pipe(
			withLatestFrom(this.overlaysService.getAllOverlays$),
			mergeMap(([[overlayDisplayMode, drops], overlays]: [[string, IOverlay[]], Map<string, IOverlay>]) => {
				if (overlayDisplayMode === this.overlayDisplayMode) {
					const pluckOverlays = <any[]> OverlaysService.pluck(overlays, drops.map(({ id }) => id), ['id', 'footprint']);
					const entitiesToDraw = pluckOverlays.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
					return this.setEntities(entitiesToDraw);
				} else if (this.getEntities().length > 0) {
					this.clearEntities();
				}
				return EMPTY;
			})
		);

	constructor(public store: Store<any>,
				public overlaysService: OverlaysService,
				public overlayDisplayMode: string,
				...superArgs
	) {
		super(...superArgs);
	}

}
