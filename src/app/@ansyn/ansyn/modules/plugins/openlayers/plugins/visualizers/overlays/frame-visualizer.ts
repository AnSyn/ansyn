import { EntitiesVisualizer } from '../entities-visualizer';
import { Observable, of } from 'rxjs';
import { Inject } from '@angular/core';
import { ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { selectActiveMapId } from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { map, tap } from 'rxjs/operators';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { UUID } from 'angular2-uuid';
import { feature } from '@turf/turf';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig]
})
export class FrameVisualizer extends EntitiesVisualizer {
	public isActive = false;

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
		this.initLayers();
		const footprint = this.iMap.getMainLayer().get('footprint');
		if (footprint) {
			const featureJson = feature(footprint);
			const entityToDraw = { id: UUID.UUID(), featureJson };
			return this.setEntities([entityToDraw]);
		}
		return of(true);
	}
}
