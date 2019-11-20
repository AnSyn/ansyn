import { Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { selectActiveMapId } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { ExtendMap } from "../../../../../overlays/reducers/extendedMap.class";
import { IMarkUpData, MarkUpClass, selectDropMarkup } from "../../../../../overlays/reducers/overlays.reducer";
import { OverlaysService } from "../../../../../overlays/services/overlays.service";
import { IOverlay } from "../../../../../overlays/models/overlay.model";

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig, OverlaysService]
})
export class OverlayHoverVisualizer extends EntitiesVisualizer {
	public isActive = false;

	@AutoSubscription
	isActive$: Observable<boolean> = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId: string) => activeMapId === this.mapId),
		tap((isActive) => this.isActive = isActive),
		tap(this.purgeCache.bind(this))
	);

	markups: ExtendMap<MarkUpClass, IMarkUpData>;

	@AutoSubscription
	hoveredOverlay$: Observable<IOverlay> = this.store$.pipe(
		select(selectDropMarkup),
		map((markups: ExtendMap<MarkUpClass, IMarkUpData>) => markups && markups.get(MarkUpClass.hover)),
		map((markUpData: IMarkUpData) => markUpData && markUpData.overlaysIds[0]),
		withLatestFrom(this.overlaysService.getAllOverlays$),
		map(([overlayId, overlays]: [string, Map<string, IOverlay>]) => overlayId && overlays.get(overlayId)),
		tap((overlay: IOverlay) => {
				this.onMarkupsChange(overlay);
			}
		)
	);

	constructor(
		public store$: Store<any>,
		public actions$: Actions,
		@Inject(VisualizersConfig) config: IVisualizersConfig,
		public overlaysService: OverlaysService
	) {
		super(config.FrameVisualizer);
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 10,
				fill: null,
				stroke: this.getStroke.bind(this),
				'stroke-width': 3
			}
		});
	}

	getStroke() {
		return this.isActive ? this.visualizerStyle.colors.active : this.visualizerStyle.colors.inactive;
	}

	public purgeCache() {
		if (this.source) {
			const features = this.source.getFeatures();
			if (features && features[0]) {
				delete (<any>features[0]).styleCache;
				this.source.refresh();
			}
		}
		return;
	}

	private onMarkupsChange(hoveredOverlay: IOverlay) {
		if (hoveredOverlay) {
			console.log('detected hover on overlay', hoveredOverlay);
		} else {
			console.log('detected no hover on overlay');
		}
	}

	// onResetView(): Observable<any> {
	// 	this.clearEntities();
	// 	this.initLayers();
	// 	const footprint = this.iMap.getMainLayer().get('footprint');
	// 	if (footprint) {
	// 		const featureJson = feature(footprint);
	// 		const entityToDraw = { id: UUID.UUID(), featureJson };
	// 		return this.setEntities([entityToDraw]);
	// 	}
	// 	return of(true);
	// }
}
