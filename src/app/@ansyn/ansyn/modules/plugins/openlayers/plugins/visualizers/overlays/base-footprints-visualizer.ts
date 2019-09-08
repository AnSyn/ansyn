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
import { selectOverlayFootprintMode } from '../../../../../menu-items/tools/reducers/tools.reducer';
import { OverlayDisplayMode } from '../../../../../menu-items/tools/overlays-display-mode/overlays-display-mode.component';

export class BaseFootprintsVisualizer extends EntitiesVisualizer {

	@AutoSubscription
	drawOverlaysOnMap$: Observable<any> = combineLatest(this.store.select(selectOverlayFootprintMode), this.store.select(selectDrops))
		.pipe(
			filter(([overlayDisplayMode, drops]: [OverlayDisplayMode, IOverlay[]]) => Boolean(overlayDisplayMode)),
			withLatestFrom(this.overlaysService.getAllOverlays$),
			mergeMap(([[overlayDisplayMode, drops], overlays]: [[OverlayDisplayMode, IOverlay[]], Map<string, IOverlay>]) => {
				if (overlayDisplayMode === this.overlayDisplayMode) {
					const pluckOverlays = <any[]>OverlaysService.pluck(overlays, drops.map(({ id }) => id), ['id', 'footprint']);
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
			geometry = turf.simplify(turf.multiPolygon(geometry.coordinates), {
				tolerance: 0.01,
				highQuality: true
			}).geometry;
		}
		return super.geometryToEntity(id, geometry);
	}

}
