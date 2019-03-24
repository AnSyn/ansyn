import { ImageryVisualizer, IVisualizersConfig, VisualizerInteractions, VisualizersConfig } from '@ansyn/imagery';
import { cloneDeep as _cloneDeep } from 'lodash';
import olMultiPolygon from 'ol/geom/MultiPolygon';
import olMultiLineString from 'ol/geom/MultiLineString';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import * as condition from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import SourceVector from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import {
	DisplayOverlayFromStoreAction,
	ExtendMap,
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	OverlaysService,
	overlaysStateSelector,
	SetMarkUp
} from '../../../../../overlays/public_api';
import { IVisualizerEntity, VisualizerStates } from '../../../../../core/public_api';
import { MultiLineString } from 'geojson';
import { distinctUntilChanged, pluck, tap } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import * as turf from '@turf/turf';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { BaseFootprintsVisualizer } from './base-footprints-visualizer';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, VisualizersConfig, OverlaysService]
})
export class FootprintPolylineVisualizer extends BaseFootprintsVisualizer {
	protected hoverLayer: VectorLayer;
	markups: ExtendMap<MarkUpClass, IMarkUpData>;

	protected disableCache = true;

	overlaysState$: Observable<IOverlaysState> = this.store.select(overlaysStateSelector);

	@AutoSubscription
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, IMarkUpData>> = this.overlaysState$.pipe(
		pluck<IOverlaysState, ExtendMap<MarkUpClass, IMarkUpData>>('dropsMarkUp'),
		distinctUntilChanged(),
		tap((markups) => this.markups = markups),
		tap(this.onMarkupsChange.bind(this))
	);

	constructor(public store: Store<any>,
				@Inject(VisualizersConfig) public config: IVisualizersConfig,
				public overlaysService: OverlaysService
	) {

		super(store, overlaysService, 'Polygon', config.FootprintPolylineVisualizer);

		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: this.getZIndex.bind(this),
				fill: 'transparent',
				stroke: this.getStrokeColor.bind(this),
				'stroke-width': this.getStrokeWidth.bind(this),
				shadow: this.getShadow.bind(this)
			},
			hover: {
				zIndex: 4,
				fill: 'white',
				'fill-opacity': 0.4,
				'stroke-width': (feature) => this.getStrokeWidth(feature, 5),
				'stroke': (feature) => this.getStrokeColor(feature, this.visualizerStyle.colors.display)
			}
		});
	}

	protected initLayers() {
		super.initLayers();
		this.createHoverLayer();
	}

	private onMarkupsChange() {
		const hover = this.markups.get(MarkUpClass.hover);
		const [overlayId] = hover.overlaysIds;
		this.setHoverFeature(overlayId);

		if (this.hoverLayer) {
			this.hoverLayer.getSource().refresh();
		}
		if (this.source) {
			this.source.refresh();
		}
	}

	private propsByFeature(feature: Feature) {
		const classes = this.markups.findKeysByValue(<string>feature.getId(), 'overlaysIds');

		const isFavorites = classes.includes(MarkUpClass.favorites);
		const isActive = classes.includes(MarkUpClass.active);
		const isDisplayed = classes.includes(MarkUpClass.displayed);

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
			'stroke-width': 5,
			stroke: this.visualizerStyle.colors.favorite
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
				let geometry: MultiLineString = entity.featureJson.geometry;
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
			this.store.dispatch(new DisplayOverlayFromStoreAction({ id }));
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
			this.iMap.removeLayer(this.hoverLayer);
		}

		this.hoverLayer = new VectorLayer({
			source: new SourceVector(),
			style: (feature: Feature) => this.featureStyle(feature, VisualizerStates.HOVER)
		});

		this.iMap.addLayer(this.hoverLayer);
	}


	onSelectFeature($event) {
		if ($event.selected.length > 0) {
			const id = $event.selected[0].getId();
			const hoverFeature = this.hoverLayer.getSource().getFeatureById(id);
			if (!hoverFeature || hoverFeature.getId() !== id) {
				this.store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [id] } }));
			}
		} else {
			this.store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
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
}
