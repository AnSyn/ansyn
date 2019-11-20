import { Observable, of } from 'rxjs';
import { Inject } from '@angular/core';
import { ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { ExtendMap } from "../../../../../overlays/reducers/extendedMap.class";
import { IMarkUpData, MarkUpClass, selectDropMarkup } from "../../../../../overlays/reducers/overlays.reducer";
import { OverlaysService } from "../../../../../overlays/services/overlays.service";
import { IOverlay } from "../../../../../overlays/models/overlay.model";
import { UUID } from "angular2-uuid";
import { feature } from '@turf/turf';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig, OverlaysService]
})
export class OverlayHoverVisualizer extends EntitiesVisualizer {

	@AutoSubscription
	hoveredOverlay$: Observable<boolean> = this.store$.pipe(
		select(selectDropMarkup),
		map((markups: ExtendMap<MarkUpClass, IMarkUpData>) => markups && markups.get(MarkUpClass.hover)),
		map((markUpData: IMarkUpData) => markUpData && markUpData.overlaysIds[0]),
		withLatestFrom(this.overlaysService.getAllOverlays$),
		map(([overlayId, overlays]: [string, Map<string, IOverlay>]) => overlayId && overlays.get(overlayId)),
		switchMap((overlay: IOverlay) => {
				return this.showOrHide$(overlay);
			}
		)
	);

	constructor(
		public store$: Store<any>,
		public actions$: Actions,
		@Inject(VisualizersConfig) config: IVisualizersConfig,
		public overlaysService: OverlaysService
	) {
		super(config.OverlayHoverVisualizer);
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 10,
				fill: null,
				stroke: '#ff0eb9',
				'stroke-width': 3
			}
		});
	}

	private showOrHide$(hoveredOverlay: IOverlay): Observable<boolean> {
		if (hoveredOverlay) {
			const featureJson = feature(hoveredOverlay.footprint);
			const entityToDraw = {id: UUID.UUID(), featureJson};
			return this.setEntities([entityToDraw]);
		} else {
			this.clearEntities();
			return of(true);
		}
	}
}
