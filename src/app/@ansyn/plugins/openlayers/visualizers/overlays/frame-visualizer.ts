import { EntitiesVisualizer } from '../entities-visualizer';
import { Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery/model/visualizers-config.token';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { ImageryVisualizer } from '@ansyn/imagery/model/decorators/imagery-visualizer';
import { ImageryPluginSubscription } from '@ansyn/imagery/model/base-imagery-plugin';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig]
})
export class FrameVisualizer extends EntitiesVisualizer {
	public isActive = false;
	private overlay;

	@ImageryPluginSubscription
	overlay$ = this.store$.select(mapStateSelector)
		.filter(() => Boolean(this.mapId))
		.map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId))
		.filter(Boolean)
		.map((map) => map.data.overlay)
		.distinctUntilChanged()
		.do((overlay) => this.overlay = overlay);

	@ImageryPluginSubscription
	isActive$: Observable<boolean> = this.store$
		.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged()
		.map((activeMapId: string) => activeMapId === this.mapId)
		.do((isActive) => this.isActive = isActive)
		.do(this.purgeCache.bind(this));

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
		this.initLayers();
		return this.setOverlay(this.overlay)
	}

}
