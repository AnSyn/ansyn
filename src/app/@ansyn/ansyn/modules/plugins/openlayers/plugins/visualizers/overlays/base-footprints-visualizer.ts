import { filter, mergeMap, withLatestFrom } from 'rxjs/operators';
import { combineLatest, Observable, of, EMPTY } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { IVisualizerEntity, IVisualizerStateStyle } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import simplify from '@turf/simplify'
import { multiPolygon } from '@turf/helpers';
import { selectDrops } from '../../../../../overlays/reducers/overlays.reducer';
import { OverlaysService } from '../../../../../overlays/services/overlays.service';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { EntitiesVisualizer } from '@ansyn/ol';

export class BaseFootprintsVisualizer extends EntitiesVisualizer {

	readonly selectDrop = this.store.pipe(
		select(selectDrops)
	);

	constructor(public store: Store<any>,
				public overlaysService: OverlaysService,
				public fpConfig: Partial<IVisualizerStateStyle>,
				...superArgs
	) {
		super(fpConfig, ...superArgs);
	}

	selectVisualizerActive = () => of(false);

	@AutoSubscription
	drawOverlaysOnMap$: () => Observable<any> = () => combineLatest([this.selectVisualizerActive(), this.selectDrop])
		.pipe(
			filter( ([isActive]) => isActive !== undefined),
			withLatestFrom(this.overlaysService.getAllOverlays$),
			mergeMap(([[isActive, drops], overlays]: [[boolean, IOverlay[]], Map<string, IOverlay>]) => {
				if (isActive) {
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
		if (geometry.type === 'MultiPolygon') {
			const numOfPoints = geometry.coordinates[0][0].length;

			if (this.fpConfig.minSimplifyVertexCountLimit < numOfPoints) {
				geometry = simplify(multiPolygon(geometry.coordinates), {
					tolerance: 0.01,
					highQuality: true
				}).geometry;
			}
		}
		return super.geometryToEntity(id, geometry);
	}
}
