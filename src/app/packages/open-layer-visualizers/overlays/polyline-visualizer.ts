import { EntitiesVisualizer, VisualizerStates } from '../entities-visualizer';
import { IMarkupEvent, IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import { cloneDeep as _cloneDeep } from 'lodash';
import { VisualizerStateStyle } from '../models/visualizer-state';
import { VisualizerEvents, VisualizerInteractions } from '@ansyn/imagery/model/imap-visualizer';
import MultiPolygon from 'ol/geom/multipolygon';
import Feature from 'ol/feature';
import Style from 'ol/style/style';
import condition from 'ol/events/condition';
import Select from 'ol/interaction/select'
import SourceVector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import { EventEmitter } from '@angular/core';

export const FootprintPolylineVisualizerType = 'FootprintPolylineVisualizer';

export class FootprintPolylineVisualizer extends EntitiesVisualizer {
	static type = FootprintPolylineVisualizerType;
	protected hoverLayer: VectorLayer;

	markups: any[] = [];

	protected disableCache = true;

	get onHoverFeature() {
		return this.events.get(VisualizerEvents.onHoverFeature);
	}

	get doubleClickFeature() {
		return this.events.get(VisualizerEvents.doubleClickFeature);
	}

	constructor(style: Partial<VisualizerStateStyle>) {
		super(FootprintPolylineVisualizerType, style);

		// No access to `this` in super constructor
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
					color: (feature) => this.getStrokeColor(feature, '#9524ad')
				}
			}
		});
		this.events.set(VisualizerEvents.onHoverFeature, new EventEmitter<any>());
		this.events.set(VisualizerEvents.doubleClickFeature, new EventEmitter<any>());
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
		const classes = this.getMarkupClasses(feature.getId());

		const isFavorites = classes.includes('favorites');
		const isActive = classes.includes('active');
		const isDisplayed = classes.includes('displayed');

		return { isFavorites, isActive, isDisplayed };
	}

	private getZIndex(feature: Feature) {
		const { isActive, isFavorites, isDisplayed } = this.propsByFeature(feature);

		return isActive ? 4 : isFavorites ? 3 : isDisplayed ? 2 : 1;
	}

	private getStrokeColor(feature: Feature, defaultColor: string = '#d393e1') {
		const { isActive, isDisplayed } = this.propsByFeature(feature);

		if (isActive) {
			return '#27b2cf';
		}
		if (isDisplayed) {
			return '#9524ad';
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
			color: 'yellow'
		};
	}

	private getStrokeWidth(feature: Feature, defaultStroke = 3) {
		const { isActive, isDisplayed, isFavorites } = this.propsByFeature(feature);

		if (isFavorites) {
			return 3;
		}

		if (isActive || isDisplayed) {
			return 5;
		}

		return defaultStroke;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		super.addOrUpdateEntities(conversion);
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
		if (this.interactions.get(VisualizerInteractions.doubleClick)) {
			this.iMap.mapObject.removeInteraction(this.interactions.get(VisualizerInteractions.doubleClick));
		}
		if (this.interactions.get(VisualizerInteractions.pointerMove)) {
			this.iMap.mapObject.removeInteraction(this.interactions.get(VisualizerInteractions.pointerMove));
		}
		this.addDoubleClickInteraction();
		this.addPointerMoveInteraction();
	}


	addPointerMoveInteraction() {
		const pointerMove = new Select({
			condition: condition.pointerMove,
			style: () => new Style(),
			layers: [this.vector]
		});
		pointerMove.on('select', this.onSelectFeature.bind(this));
		this.iMap.mapObject.addInteraction(pointerMove);
		this.interactions.set(VisualizerInteractions.pointerMove, pointerMove);
	}

	onDoubleClickFeature($event) {
		this.purgeCache();

		if ($event.selected.length > 0) {
			const feature = $event.selected[0];

			const visualizerType = this.type;
			const id = feature.getId();
			this.doubleClickFeature.emit({ visualizerType, id });
		}
	}

	addDoubleClickInteraction() {
		const doubleClickInteraction = new Select({
			condition: condition.doubleClick,
			style: () => new Style({}),
			layers: [this.vector]
		});
		doubleClickInteraction.on('select', this.onDoubleClickFeature.bind(this));
		this.iMap.mapObject.addInteraction(doubleClickInteraction);
		this.interactions.set(VisualizerInteractions.doubleClick, doubleClickInteraction);
	}

	private createHoverFeature(selectedFeature: Feature): void {
		const selectedFeatureCoordinates = [[...selectedFeature.getGeometry().getCoordinates()]];
		const hoverFeature = new Feature(new MultiPolygon(selectedFeatureCoordinates));
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
			style: (feature) => this.featureStyle(feature, VisualizerStates.HOVER)
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
		this.hoverLayer.getSource().refresh();
		if (this.source) {
			this.source.refresh();
		}
	}
	protected purgeCache(feature?: Feature) {
		if (feature) {
			delete feature.styleCache;
		} else if (this.source) {
			let features = this.source.getFeatures();
			if (this.hoverLayer && this.hoverLayer.getSource()) {
				features = features.concat(this.hoverLayer.getSource().getFeatures());
			}
			features.forEach(f => this.purgeCache(f));
		}
	}
}
