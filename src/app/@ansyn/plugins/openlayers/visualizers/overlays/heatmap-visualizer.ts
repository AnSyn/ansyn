import { EntitiesVisualizer } from '../entities-visualizer';
import { Observable } from 'rxjs/Observable';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, Actions]
})
export class FootprintHeatmapVisualizer extends EntitiesVisualizer {

	drawOverlaysOnMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.DRAW_OVERLAY_ON_MAP)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector))
		.map(([action, overlaysState, { mapsList }]) => [MapFacadeService.mapById(mapsList, this.mapId), overlaysState])
		.filter(([map]) => Boolean(map))
		.mergeMap(([map, { overlays, filteredOverlays }]: [CaseMapState, IOverlaysState]) => {
			if (map.data.overlayDisplayMode === 'Heatmap') {
				const pluckOverlays = <any[]> OverlaysService.pluck(overlays, filteredOverlays, ['id', 'footprint']);
				const entitiesToDraw = pluckOverlays.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
				return this.setEntities(entitiesToDraw);
			} else if (this.getEntities().length > 0) {
				this.clearEntities();
			}
			return Observable.empty();
		});

	constructor(public store$: Store<any>, public actions$: Actions) {
		super(null, {
			opacity: 0.5,
			initial: {
				fill: {
					color: 'rgba(255, 0, 0, 0.05)'
				},
				stroke: {
					color: 'rgba(0, 0, 0, 0.02)'
				}
			}
		});
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.drawOverlaysOnMap$.subscribe()
		);
	}
}
