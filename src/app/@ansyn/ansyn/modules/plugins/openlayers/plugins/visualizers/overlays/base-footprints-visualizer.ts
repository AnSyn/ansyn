import { EntitiesVisualizer } from '../entities-visualizer';
import { combineLatest, Observable } from 'rxjs';
import { IMapState, MapFacadeService, mapStateSelector, selectMapsList } from '@ansyn/map-facade';
import { OverlaysService, selectDrops } from '../../../../../overlays/public_api';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ICaseMapState, IOverlay, IVisualizerEntity, IVisualizerStateStyle } from '@ansyn/core';
import { mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { EMPTY } from 'rxjs/index';
import * as turf from '@turf/turf';

export class BaseFootprintsVisualizer extends EntitiesVisualizer {

	overlayDisplayMode$: Observable<string> = this.store
		.pipe(
			select(selectMapsList),
			map((mapsList: ICaseMapState[]) => MapFacadeService.mapById(mapsList, this.mapId)),
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
				public fpConfig: Partial<IVisualizerStateStyle>,
				...superArgs
	) {
		super(fpConfig, ...superArgs);
	}

	geometryToEntity(id, geometry): IVisualizerEntity {
		const numOfPoints = geometry.coordinates[0][0].length;

		if (this.fpConfig.minSimplifyVertexCountLimit < numOfPoints) {
			geometry = turf.simplify(turf.multiPolygon(geometry.coordinates), { tolerance: 0.01, highQuality: true }).geometry;
		}
		return super.geometryToEntity(id, geometry);
	}

}
