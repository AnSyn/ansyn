import { combineLatest, Observable } from 'rxjs';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { IVisualizerEntity, IVisualizerStateStyle } from '@ansyn/imagery';
import { mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { EMPTY } from 'rxjs/index';
import * as turf from '@turf/turf';
import { selectDrops } from '../../../../../overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../../../../overlays/services/overlays.service';
import { ICaseMapState } from '../../../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { EntitiesVisualizer } from '@ansyn/ol';

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
					const entitiesToDraw = pluckOverlays
						.filter(({ id, footprint }) => footprint.type === 'MultiPolygon')
						.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
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
