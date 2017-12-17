import { IMap, IMapVisualizer, IVisualizerEntity } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
import { merge } from 'lodash';

import SourceVector from 'ol/source/vector';
import Feature from 'ol/feature';
import GeoJSON from 'ol/format/geojson';
import Style from 'ol/style/style';
import condition from 'ol/events/condition';
import MultiPolygon from 'ol/geom/multipolygon';

import Select from 'ol/interaction/select';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import Vector from 'ol/layer/vector';
import olMap from 'ol/map';
import { Subscriber } from 'rxjs/Subscriber';
import { VisualizerStyle } from './models/visualizer-style';
import { VisualizerStateStyle } from './models/visualizer-state';
import { OpenLayersMap } from '@ansyn/open-layers-map/map/open-layers-map';
import { Subject } from 'rxjs/Subject';

export interface FeatureIdentifier {
	feature: Feature,
	originalEntity: IVisualizerEntity
}

export const VisualizerStates = {
	INITIAL: 'initial',
	HOVER: 'hover'
};

export const EntitiesVisualizerType = 'EntitiesVisualizer';


export abstract class EntitiesVisualizer implements IMapVisualizer {
	static type = EntitiesVisualizerType;

	isHideable = false;
	isHidden = false;

	protected iMap: IMap<olMap>;
	protected mapId: string;
	public source: Vector;
	protected featuresCollection: Feature[];
	protected footprintsVector: VectorLayer;
	protected default4326GeoJSONFormat: GeoJSON = new GeoJSON({
		defaultDataProjection: 'EPSG:4326',
		featureProjection: 'EPSG:4326'
	});
	protected idToEntity: Map<string, FeatureIdentifier> = new Map<string, { feature: null, originalEntity: null }>();
	protected hoverLayer: Vector;

	protected disableCache = false;

	protected visualizerStyle: VisualizerStateStyle = {
		opacity: 1,
		initial: {
			fill: {
				color: 'transparent'
			},
			stroke: {
				color: 'blue',
				width: 3
			}
		}
	};

	private interactions: { doubleClick: Select, pointerMove: Select } = { doubleClick: null, pointerMove: null };
	private enabledInteractions = { doubleClick: false, pointMove: false };

	onDisposedEvent: EventEmitter<void> = new EventEmitter<void>();
	onHoverFeature: EventEmitter<any> = new EventEmitter<any>();
	doubleClickFeature: EventEmitter<any> = new EventEmitter<any>();
	subscribers: Subscriber<any>[] = [];

	events: Map<string, Subject<any>> = new Map<string, Subject<any>>();

	constructor(public type: string, visualizerStyle: Partial<VisualizerStateStyle>, defaultStyle: Partial<VisualizerStateStyle> = {}) {
		merge(this.visualizerStyle, defaultStyle, visualizerStyle);
	}

	protected enableInteraction(interaction: string) {
		this.enabledInteractions[interaction] = true;
	}

	private getEntity(feature: Feature): IVisualizerEntity {
		const entity = this.idToEntity.get(feature.getId());
		return entity && entity.originalEntity;
	}

	onInit(mapId: string, map: IMap<OpenLayersMap>) {
		this.iMap = map;
		this.mapId = mapId;
		this.events = new Map<string, Subject<any>>();
		this.initLayers();
	}

	protected initLayers() {
		this.createStaticLayers();

		if (this.enabledInteractions.pointMove) {
			this.createHoverLayer();
		}

		this.resetInteractions();
	}

	protected createStaticLayers() {
		this.featuresCollection = [];
		this.source = new SourceVector({ features: this.featuresCollection });

		this.footprintsVector = new VectorLayer({
			source: this.source,
			style: this.featureStyle.bind(this),
			opacity: this.visualizerStyle.opacity
		});

		if (!this.isHidden) {
			this.iMap.addLayer(this.footprintsVector);
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

	private resetInteractions(): void {
		if (this.enabledInteractions.doubleClick) {
			if (this.interactions.doubleClick) {
				this.iMap.mapObject.removeInteraction(this.interactions.doubleClick);
			}
			this.addDoubleClickInteraction();
		}

		if (this.enabledInteractions.pointMove) {
			if (this.interactions.pointerMove) {
				this.iMap.mapObject.removeInteraction(this.interactions.pointerMove);
			}
			this.addPointerMoveInteraction();
		}
	}

	toggleVisibility() {
		if (!this.isHideable) {
			return;
		}

		this.isHidden = !this.isHidden;
		if (this.isHidden) {
			this.iMap.removeLayer(this.footprintsVector);
		} else {
			this.iMap.addLayer((this.footprintsVector));
		}
	}

	private purgeCache(feature?: Feature) {
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

	private fixStyleValues(feature: Feature, styleSettings: any) {
		Object.keys(styleSettings).forEach(key => {
			if (styleSettings[key]) {
				switch (typeof styleSettings[key]) {
					case 'function':
						styleSettings[key] = styleSettings[key](feature);
						break;
					case 'object':
						this.fixStyleValues(feature, styleSettings[key]);
						break;
				}
			}
		});
	}

	private createStyle(feature: Feature, ...styles: Array<Partial<VisualizerStyle>>) {
		const styleSettings: any = merge({}, ...styles);
		this.fixStyleValues(feature, styleSettings);

		let secondaryStyle: any = {};

		if (styleSettings.shadow) {
			secondaryStyle.stroke = new Stroke(styleSettings.shadow);
			delete styleSettings.shadow;
		}

		if (styleSettings.stroke) {
			styleSettings.stroke = new Stroke(styleSettings.stroke);
		}

		if (styleSettings.fill) {
			styleSettings.fill = new Fill(styleSettings.fill);
		}

		if (styleSettings.icon) {
			styleSettings.image = new Icon(styleSettings.icon);
		}

		if (styleSettings.label) {
			styleSettings.text = new Text(this.createStyle(feature, styleSettings.label));
		}

		if (Object.keys(secondaryStyle).length !== 0) {
			return [styleSettings, secondaryStyle].map(s => new Style(s));
		}

		return new Style(styleSettings);
	}

	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		if (this.disableCache || !feature.styleCache) {
			const styles = [
				this.visualizerStyle[VisualizerStates.INITIAL], // Weakest
				this.visualizerStyle[state]
			];

			const entity = this.getEntity(feature);
			if (entity) {
				if (entity.type && this.visualizerStyle.entities && this.visualizerStyle.entities[entity.type]) {
					styles.push(this.visualizerStyle.entities[entity.type][VisualizerStates.INITIAL]);
					styles.push(this.visualizerStyle.entities[entity.type][state]);
				}

				if (entity.style) {
					styles.push(entity.style[VisualizerStates.INITIAL]);
					styles.push(entity.style[state]);
				}
			}

			feature.styleCache = this.createStyle(feature, ...styles);
		}

		return feature.styleCache;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const logicalEntitiesCopy = [...logicalEntities];
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();

		const featuresArray = [];
		const featuresCollectionToAdd: GeoJSON.FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: featuresArray
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity) => {
			const existingEntity = this.idToEntity.get(entity.id);
			if (existingEntity) {
				const newGeometry = this.default4326GeoJSONFormat.readGeometry(entity.featureJson.geometry, {
					dataProjection: 'EPSG:4326',
					featureProjection: projection.getCode()
				});
				existingEntity.feature.setGeometry(newGeometry);
				existingEntity.originalEntity = entity;
			} else {
				const clonedFeatureJson = { ...entity.featureJson };
				clonedFeatureJson.id = entity.id;
				featuresCollectionToAdd.features.push(clonedFeatureJson);
				this.idToEntity.set(entity.id, { originalEntity: entity, feature: null });
			}
		});

		const featuresCollectionGeojson = JSON.stringify(featuresCollectionToAdd);
		const features = this.default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		features.forEach((feature: Feature) => {
			const id: string = <string>feature.getId();
			const existingEntity = this.idToEntity.get(id);
			this.idToEntity.set(id, { ...existingEntity, feature: feature });
		});
		this.source.addFeatures(features);
	}

	setEntities(logicalEntities: IVisualizerEntity[]) {
		const removedEntities = [];
		this.idToEntity.forEach(((value, key: string) => {
			const item = logicalEntities.find((entity) => entity.id === key);
			if (!item) {
				removedEntities.push(key);
			}
		}));

		removedEntities.forEach((id) => {
			this.removeEntity(id);
		});

		this.addOrUpdateEntities(logicalEntities);
	}

	removeEntity(logicalEntityId: string) {
		const entityToRemove = this.idToEntity.get(logicalEntityId);
		if (entityToRemove) {
			this.idToEntity.delete(logicalEntityId);
			this.source.removeFeature(entityToRemove.feature);
		}
	}

	clearEntities() {
		this.idToEntity.clear();
		this.source.clear(true);
	}

	getEntities(): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		this.idToEntity.forEach((val, key) => entities.push(val.originalEntity));
		return entities;
	}

	onResetView() {
		const currentEntities: IVisualizerEntity[] = this.getEntities();
		this.clearEntities();
		this.initLayers();
		this.addOrUpdateEntities(currentEntities);
	}

	dispose() {
		this.onDisposedEvent.emit();
		this.subscribers.forEach(sub => sub.unsubscribe());
		this.subscribers = [];
	}

	updateStyle(style: Partial<VisualizerStateStyle>) {
		merge(this.visualizerStyle, style);
		this.purgeCache();
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

	addPointerMoveInteraction() {
		this.interactions.pointerMove = new Select({
			condition: condition.pointerMove,
			style: () => new Style(),
			layers: [this.footprintsVector]
		});
		this.interactions.pointerMove.on('select', this.onSelectFeature.bind(this));
		this.iMap.mapObject.addInteraction(this.interactions.pointerMove);
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
		this.interactions.doubleClick = new Select({
			condition: condition.doubleClick,
			style: () => new Style({}),
			layers: [this.footprintsVector]
		});
		this.interactions.doubleClick.on('select', this.onDoubleClickFeature.bind(this));
		this.iMap.mapObject.addInteraction(this.interactions.doubleClick);
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

	updateFeatureStyle(featureId: string, style: Partial<VisualizerStateStyle>) {
		const feature = this.source.getFeatureById(featureId);

		const entity = this.getEntity(feature.getId());
		if (entity) {
			entity.style = entity.style ? merge({}, entity.style, style) : style;
		}

		this.purgeCache(feature);
	}
}
