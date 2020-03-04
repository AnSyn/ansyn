import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { filter, mergeMap, withLatestFrom } from 'rxjs/operators';
import { IVisualizerEntity, IVisualizerStateStyle } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import * as turf from '@turf/turf';
import { selectDrops } from '../../../../../overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../../../../overlays/services/overlays.service';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { EntitiesVisualizer } from '@ansyn/ol';
import { OverlayDisplayMode } from '../../../../../menu-items/tools/overlays-display-mode/overlays-display-mode.component';
import { selectOverlayDisplayModeByMapId } from '@ansyn/map-facade';

export class BaseFootprintsVisualizer extends EntitiesVisualizer {

	constructor(public store: Store<any>,
				public overlaysService: OverlaysService,
				public overlayDisplayMode: string,
				public fpConfig: Partial<IVisualizerStateStyle>,
				...superArgs
	) {
		super(fpConfig, ...superArgs);
	}

	@AutoSubscription
	drawOverlaysOnMap$: () => Observable<any> = () => combineLatest(this.store.select(selectOverlayDisplayModeByMapId(this.mapId)), this.store.select(selectDrops))
		.pipe(
			filter(([overlayDisplayMode, drops]: [OverlayDisplayMode, IOverlay[]]) => Boolean(overlayDisplayMode)),
			withLatestFrom(this.overlaysService.getAllOverlays$),
			mergeMap(([[overlayDisplayMode, drops], overlays]: [[OverlayDisplayMode, IOverlay[]], Map<string, IOverlay>]) => {
				if (overlayDisplayMode === this.overlayDisplayMode) {
					const pluckOverlays = <any[]>OverlaysService.pluck(overlays, drops.map(({ id }) => id), ['id', 'footprint']);
					const entitiesToDraw = pluckOverlays
						.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
					return this.setEntities(entitiesToDraw);
				} else if (this.getEntities().length > 0) {
					this.clearEntities();
				}
				return EMPTY;
			})
		);

	geometryToEntity(id, geometry): IVisualizerEntity {
		if ( geometry.type === 'MultiPolygon') {
			const numOfPoints = geometry.coordinates[0][0].length;

			if (this.fpConfig.minSimplifyVertexCountLimit < numOfPoints) {
				geometry = turf.simplify(turf.multiPolygon(geometry.coordinates), {
					tolerance: 0.01,
					highQuality: true
				}).geometry;
			}
		}
		return super.geometryToEntity(id, geometry);
	}

}
