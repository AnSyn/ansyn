import { EntitiesVisualizer } from '../entities-visualizer';
import { Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery/model/visualizers-config.token';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { selectActiveMapId } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryVisualizer } from '@ansyn/imagery/decorators/imagery-visualizer';
import { AutoSubscription } from 'auto-subscriptions';
import {
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '@ansyn/overlays/actions/overlays.actions';
import { filter, map, mergeMap, tap } from 'rxjs/operators';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig]
})
export class FrameVisualizer extends EntitiesVisualizer {
	public isActive = false;

	@AutoSubscription
	overlay$ = this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		filter((action: DisplayOverlaySuccessAction) => this.mapId === action.payload.mapId),
		mergeMap((action: DisplayOverlaySuccessAction) => this.setOverlay(action.payload.overlay))
	);

	@AutoSubscription
	isActive$: Observable<boolean> = this.store$.pipe(
		select(selectActiveMapId),
		map((activeMapId: string) => activeMapId === this.mapId),
		tap((isActive) => this.isActive = isActive),
		tap(this.purgeCache.bind(this))
	);

	constructor(public store$: Store<any>,
				public actions$: Actions,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
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

	setOverlay(overlay: IOverlay) {
		if (overlay) {
			const { id, footprint } = overlay;
			const featureJson: GeoJSON.Feature<any> = { type: 'Feature', geometry: footprint, properties: {} };
			const entityToDraw = { id, featureJson };
			return this.setEntities([entityToDraw]);
		}
		return Observable.of(true);
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

	onResetView(): Observable<any> {
		this.clearEntities();
		return super.onResetView();
	}
}
