import { EntitiesVisualizer } from '../entities-visualizer';
import { combineLatest, Observable } from 'rxjs';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import {
	IOverlaysState, overlaysStateSelector,
	selectFilteredOveralys, selectOverlaysArray, selectOverlaysMap
} from '@ansyn/overlays/reducers/overlays.reducer';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { empty } from 'rxjs';
import { ImageryVisualizer } from '@ansyn/imagery/model/decorators/imagery-visualizer';
import { select } from '@ngrx/store';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { mergeMap, withLatestFrom } from 'rxjs/internal/operators';
import { ImageryPluginSubscription } from '@ansyn/imagery/model/base-imagery-plugin';

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
			map((map) => map.data.overlayDisplayMode),
			distinctUntilChanged()
		);

	@ImageryPluginSubscription
	drawOverlaysOnMap$: Observable<any> = combineLatest(this.overlayDisplayMode$, this.store$.pipe(select(selectFilteredOveralys)))
		.pipe(
			withLatestFrom(this.store$.select(selectOverlaysMap)),
			mergeMap(([[overlayDisplayMode, filteredOverlays], overlays]: [[string, string[]], Map<string, Overlay>]) => {
				if (overlayDisplayMode === 'Heatmap') {
					const pluckOverlays = <any[]> OverlaysService.pluck(overlays, filteredOverlays, ['id', 'footprint']);
					const entitiesToDraw = pluckOverlays.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
					return this.setEntities(entitiesToDraw);
				} else if (this.getEntities().length > 0) {
					this.clearEntities();
				}
				return empty();
			})
		);


	constructor(public store$: Store<IAppState>, public actions$: Actions) {
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

}
