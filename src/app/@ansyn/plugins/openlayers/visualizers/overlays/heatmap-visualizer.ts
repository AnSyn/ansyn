import { EntitiesVisualizer } from '../entities-visualizer';
import { combineLatest, Observable } from 'rxjs';
import { IMapState, MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { OverlaysService, selectFilteredOveralys, selectOverlaysMap } from '@ansyn/overlays';
import { select, Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ImageryVisualizer } from '@ansyn/imagery';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ICaseMapState, IOverlay, IVisualizerEntity } from '@ansyn/core';
import { mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import * as turf from '@turf/turf';
import { OpenLayersMap } from '../../open-layers-map/openlayers-map/openlayers-map';
import { EMPTY } from 'rxjs/index';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions]
})
export class FootprintHeatmapVisualizer extends EntitiesVisualizer {

	overlayDisplayMode$: Observable<string> = this.store$
		.pipe(
			select(mapStateSelector),
			map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: ICaseMapState) => map.data.overlayDisplayMode),
			distinctUntilChanged()
		);

	@AutoSubscription
	drawOverlaysOnMap$: Observable<any> = combineLatest(this.overlayDisplayMode$, this.store$.pipe(select(selectFilteredOveralys)))
		.pipe(
			withLatestFrom(this.store$.select(selectOverlaysMap)),
			mergeMap(([[overlayDisplayMode, filteredOverlays], overlays]: [[string, string[]], Map<string, IOverlay>]) => {
				if (overlayDisplayMode === 'Heatmap') {
					const pluckOverlays = <any[]> OverlaysService.pluck(overlays, filteredOverlays, ['id', 'footprint']);
					const entitiesToDraw = pluckOverlays.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
					return this.setEntities(entitiesToDraw);
				} else if (this.getEntities().length > 0) {
					this.clearEntities();
				}
				return EMPTY;
			})
		);

	geometryToEntity(id, footprint): IVisualizerEntity {
		const fp = turf.simplify(turf.multiPolygon(footprint.coordinates), { tolerance: 0.01, highQuality: true });
		return super.geometryToEntity(id, fp.geometry);
	}

	constructor(public store$: Store<any>, public actions$: Actions) {
		super(null, {
			opacity: 0.5,
			initial: {
				fill: 'rgb(255, 0, 0)',
				'fill-opacity': 0.05,
				stroke: 'rgb(0, 0, 0)',
				'stroke-opacity': 0.02
			}
		});
	}

}
