import { EntitiesVisualizer, VisualizerStates } from '../entities-visualizer';
import {
	IMarkupEvent,
	IVisualizerEntity,
	VisualizerEvents,
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
import { CommunicatorEntity } from '@ansyn/imagery';

@Injectable()
export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	protected hoverLayer: VectorLayer;

	markups: any[] = [];

	protected disableCache = true;

	get onHoverFeature() {
		return this.events.get(VisualizerEvents.onHoverFeature);
	}

	get doubleClickFeature() {
		return this.events.get(VisualizerEvents.doubleClickFeature);
	}

	constructor(public store: Store<any>, @Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(config[FootprintPolylineVisualizer.name]);

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

	init(communicator: CommunicatorEntity) {
		super.init(communicator);
		this.initDispatchers(this.store);
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

	protected resetEvents(): void {
		this.removeEvent(VisualizerEvents.onHoverFeature);
		this.removeEvent(VisualizerEvents.doubleClickFeature);
		this.addEvent(VisualizerEvents.onHoverFeature);
		this.addEvent(VisualizerEvents.doubleClickFeature);
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

			const visualizerType = this.constructor;
			const id = feature.getId();
			this.doubleClickFeature.emit({ visualizerType, id });
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
		const event = { visualizerType: this.type };
		if ($event.selected.length > 0) {
			const id = $event.selected[0].getId();
			const hoverFeature = this.hoverLayer.getSource().getFeatureById(id);
			if (!hoverFeature || hoverFeature.getId() !== id) {
				this.onHoverFeature.emit({ ...event, id });
			}
		} else {
			this.onHoverFeature.emit({ ...event });
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
}
