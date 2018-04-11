import { EntitiesVisualizer, VisualizerStates } from '../entities-visualizer';
import {
	IMarkupEvent,
	IVisualizerEntity,
	VisualizerInteractions
} from '@ansyn/imagery/model/base-imagery-visualizer';
import { cloneDeep as _cloneDeep } from 'lodash';
import olMultiPolygon from 'ol/geom/multipolygon';
import olMultiLineString from 'ol/geom/multilinestring';
import Feature from 'ol/feature';
import Style from 'ol/style/style';
import condition from 'ol/events/condition';
import Select from 'ol/interaction/select';
import SourceVector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { Store } from '@ngrx/store';
import { HoverFeatureTriggerAction } from '@ansyn/map-facade/actions';
import {
	DisplayOverlayFromStoreAction, OverlaysActionTypes,
	OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Actions } from '@ngrx/effects';
import { CommunicatorEntity } from '@ansyn/imagery';
import { MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { IOverlaysState } from '@ansyn/overlays/reducers/overlays.reducer';
import { overlaysStateSelector } from '@ansyn/overlays';

@Injectable()
export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	protected hoverLayer: VectorLayer;
	markups: any[] = [];
	protected disableCache = true;

	drawOverlaysOnMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.DRAW_OVERLAY_ON_MAP)
		.withLatestFrom(this.store.select(overlaysStateSelector), this.store.select(mapStateSelector))
		.map(([action, overlaysState, { mapsList }]) => [MapFacadeService.mapById(mapsList, this.mapId), overlaysState])
		.filter(([map]) => Boolean(map))
		.mergeMap(([map, { overlays, filteredOverlays }]: [CaseMapState, IOverlaysState]) => {
			if (map.data.overlayDisplayMode === 'Polygon') {
				const pluckOverlays = <any[]> OverlaysService.pluck(overlays, filteredOverlays, ['id', 'footprint']);
				const entitiesToDraw = pluckOverlays.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
				return this.setEntities(entitiesToDraw);
			} else if (this.getEntities().length > 0) {
				this.clearEntities();
			}
			return Observable.empty();
		});

	onHoverFeatureEmitSyncHoverFeature$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.do((action: HoverFeatureTriggerAction): void => this.setHoverFeature(action.payload.id) );

	markupVisualizer$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.do((action: OverlaysMarkupAction) => this.setMarkupFeatures(action.payload));

	constructor(public store: Store<any>,
				public actions$: Actions,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {

		super(config.FootprintPolylineVisualizer);

		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: this.getZIndex.bind(this),
				fill: null,
				stroke: {
					width: this.getStrokeWidth.bind(this),
					color: this.getStrokeColor.bind(this)
				},
				shadow: this.getShadow.bind(this)
			},
			hover: {
				zIndex: 4,
				fill: { color: 'rgba(255, 255, 255, 0.4)' },
				stroke: {
					width: (feature) => this.getStrokeWidth(feature, 5),
					color: (feature) => this.getStrokeColor(feature, this.visualizerStyle.colors.display)
				}
			}
		});
	}

	private getMarkupClasses(featureId: string): string[] {
		return this.markups
			.filter(({ id }) => id === featureId)
			.map((mark: any) => mark.class);
	}

	protected initLayers() {
		super.initLayers();
		this.createHoverLayer();
	}

	private propsByFeature(feature: Feature) {
		const classes = this.getMarkupClasses(<string>feature.getId());

		const isFavorites = classes.includes('favorites');
		const isActive = classes.includes('active');
		const isDisplayed = classes.includes('displayed');

		return { isFavorites, isActive, isDisplayed };
	}

	private getZIndex(feature: Feature) {
		const { isActive, isFavorites, isDisplayed } = this.propsByFeature(feature);

		return isActive ? 4 : isFavorites ? 3 : isDisplayed ? 2 : 1;
	}

	private getStrokeColor(feature: Feature, defaultColor: string = this.visualizerStyle.colors.inactive) {
		const { isActive, isDisplayed } = this.propsByFeature(feature);

		if (isActive) {
			return this.visualizerStyle.colors.active;
		}
		if (isDisplayed) {
			return this.visualizerStyle.colors.display;
		}

		return defaultColor;
	}

	private getShadow(feature: Feature) {
		const { isFavorites } = this.propsByFeature(feature);

		if (!isFavorites) {
			return;
		}

		return {
			width: 5,
			color: this.visualizerStyle.colors.favorite
		};
	}

	private getStrokeWidth(feature: Feature, defaultStroke = 3) {
		const { isActive, isDisplayed, isFavorites } = this.propsByFeature(feature);

		if (isFavorites) {
			return 4;
		}

		if (isActive || isDisplayed) {
			return 5;
		}

		return defaultStroke;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		return super.addOrUpdateEntities(conversion);
	}

	private convertPolygonToPolyline(logicalEntities: IVisualizerEntity[]): IVisualizerEntity[] {
		const clonedLogicalEntities = _cloneDeep(logicalEntities);
		clonedLogicalEntities
			.filter((entity: IVisualizerEntity) => entity.featureJson.geometry.type === 'MultiPolygon')
			.forEach((entity: IVisualizerEntity) => {
				let geometry: GeoJSON.MultiLineString = entity.featureJson.geometry;
				geometry.type = 'MultiLineString';
				geometry.coordinates = <any> geometry.coordinates[0];
			});
		return clonedLogicalEntities;
	}

	protected resetInteractions(): void {
		this.removeInteraction(VisualizerInteractions.doubleClick);
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.addInteraction(VisualizerInteractions.pointerMove, this.createPointerMoveInteraction());
		this.addInteraction(VisualizerInteractions.doubleClick, this.createDoubleClickInteraction());
	}

	createPointerMoveInteraction() {
		const pointerMove = new Select({
			condition: condition.pointerMove,
			style: () => new Style(),
			layers: [this.vector]
		});
		pointerMove.on('select', this.onSelectFeature.bind(this));
		return pointerMove;
	}

	onDoubleClickFeature($event) {
		this.purgeCache();

		if ($event.selected.length > 0) {
			const feature = $event.selected[0];
			const id = feature.getId();
			this.store.dispatch(new DisplayOverlayFromStoreAction({ id }))
		}
	}

	createDoubleClickInteraction() {
		const doubleClick = new Select({
			condition: condition.doubleClick,
			style: () => new Style({}),
			layers: [this.vector]
		});
		doubleClick.on('select', this.onDoubleClickFeature.bind(this));
		return doubleClick;
	}

	private createHoverFeature(selectedFeature: Feature): void {
		const selectedFeatureCoordinates = [[...(<olMultiLineString>selectedFeature.getGeometry()).getCoordinates()]];
		const hoverFeature = new Feature(new olMultiPolygon(selectedFeatureCoordinates));
		hoverFeature.setId(selectedFeature.getId());
		this.hoverLayer.getSource().addFeature(hoverFeature);
	}

	setHoverFeature(featureId: string) {
		this.hoverLayer.getSource().clear();

		if (featureId) {
			const feature = this.source.getFeatureById(featureId);
			if (feature) {
				this.createHoverFeature(feature);
			}
		}
	}

	protected createHoverLayer() {
		if (this.hoverLayer) {
			this.iMap.mapObject.removeLayer(this.hoverLayer);
		}

		this.hoverLayer = new VectorLayer({
			source: new SourceVector(),
			style: (feature: Feature) => this.featureStyle(feature, VisualizerStates.HOVER)
		});

		this.iMap.mapObject.addLayer(this.hoverLayer);
	}

	onSelectFeature($event) {
		if ($event.selected.length > 0) {
			const id = $event.selected[0].getId();
			const hoverFeature = this.hoverLayer.getSource().getFeatureById(id);
			if (!hoverFeature || hoverFeature.getId() !== id) {
				this.store.dispatch(new HoverFeatureTriggerAction({ id }));
			}
		} else {
			this.store.dispatch(new HoverFeatureTriggerAction({}));
		}
	}

	setMarkupFeatures(markups: IMarkupEvent) {
		this.markups = markups;
		if (this.hoverLayer) {
			this.hoverLayer.getSource().refresh();
		}
		if (this.source) {
			this.source.refresh();
		}
	}

	public purgeCache(feature?: Feature) {
		if (feature) {
			delete (<any>feature).styleCache;
		} else if (this.source) {
			let features = this.source.getFeatures();
			if (this.hoverLayer && this.hoverLayer.getSource()) {
				features = features.concat(this.hoverLayer.getSource().getFeatures());
			}
			features.forEach(f => this.purgeCache(f));
		}
	}

	onInit() {
		this.subscriptions.push(
			this.drawOverlaysOnMap$.subscribe(),
			this.onHoverFeatureEmitSyncHoverFeature$.subscribe(),
			this.markupVisualizer$.subscribe()
		)
	}
}
