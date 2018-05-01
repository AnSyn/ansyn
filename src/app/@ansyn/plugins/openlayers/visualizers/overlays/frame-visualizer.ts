import { EntitiesVisualizer } from '../entities-visualizer';
import { Observable } from 'rxjs/Observable';
import { Inject, Injectable } from '@angular/core';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { BackToWorldView, CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

@ImageryPlugin({
	supported: [OpenlayersMapName],
	deps: [Store, Actions, VisualizersConfig]
})
export class FrameVisualizer extends EntitiesVisualizer {
	public markups: any[] = [];
	public isActive = false;

	drawFrameToOverLay$: Observable<DisplayOverlaySuccessAction> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.mapId)
		.map(({ payload }: DisplayOverlaySuccessAction) => payload.overlay)
		.mergeMap(this.setOverlay.bind(this));

	isActive$: Observable<boolean> = this.store$
		.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged()
		.map((activeMapId: string) => activeMapId === this.mapId)
		.do((isActive) => this.isActive = isActive)
		.do(this.purgeCache.bind(this));

	removeOverlayFram$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.BACK_TO_WORLD_VIEW)
		.filter((action: BackToWorldView) => action.payload.mapId === this.mapId)
		.do(this.clearEntities.bind(this));

	constructor(public store$: Store<any>,
				public actions$: Actions,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(config.FrameVisualizer);
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 10,
				fill: null,
				stroke: {
					width: 3,
					color: this.getStroke.bind(this)
				}
			}
		});
	}

	setOverlay({ id, footprint }: Overlay) {
		const featureJson: GeoJSON.Feature<any> = { type: 'Feature', geometry: footprint, properties: {} };
		const entityToDraw = { id, featureJson };
		return this.setEntities([entityToDraw]);
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

	onResetView(): Observable<boolean> {
		this.clearEntities();
		this.initLayers();
		return Observable.of(true);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.drawFrameToOverLay$.subscribe(),
			this.isActive$.subscribe(),
			this.removeOverlayFram$.subscribe()
		);
	}
}
