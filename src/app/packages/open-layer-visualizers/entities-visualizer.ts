/**
 * Created by AsafMas on 02/08/2017.
 */
import { IMap, IMapVisualizer, IVisualizerEntity } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';

import Vector from 'ol/source/vector';
import Feature from 'ol/feature';
import GeoJSON from 'ol/format/geojson';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import VectorLayer from 'ol/layer/vector';
import { Subscriber } from 'rxjs/Subscriber';

export const EntitiesVisualizerType = 'EntitiesVisualizerType';

export class EntitiesVisualizer implements IMapVisualizer {

	type: string;
	_imap: IMap;
	_mapId: string;
	_source: Vector;
	_featuresCollection: Feature[];
	_footprintsVector: VectorLayer;
	_styleCache: any;
	_default4326GeoJSONFormat: GeoJSON;
	_idToEntity: Map<string, { feature: Feature, originalEntity: IVisualizerEntity }>;
	strokeColor = 'blue';
	fillColor = 'transparent';
	containerLayerOpacity = 1;

	onDisposedEvent: EventEmitter<any> = new EventEmitter();
	onHoverFeature: EventEmitter<any> = new EventEmitter();
	doubleClickFeature: EventEmitter<any> = new EventEmitter();
	subscribers: Subscriber<any>[] = [];

	constructor(visualizerType: string, args: any) {
		this.type = visualizerType;

		this._default4326GeoJSONFormat = new GeoJSON({
			defaultDataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:4326'
		});

		this._idToEntity = new Map<string, { feature: null, originalEntity: null }>();
	}

	onInit(mapId: string, map: IMap) {
		this._imap = map;
		this._mapId = mapId;
		this.createLayer();
	}

	createLayer() {
		this._featuresCollection = [];
		this._source = new Vector({
			features: this._featuresCollection
		});

		this._styleCache = {};
		this._footprintsVector = new VectorLayer({
			source: this._source,
			style: this.featureStyle.bind(this),
			opacity: this.containerLayerOpacity
		});
		this._imap.addLayer(this._footprintsVector);
	}

	featureStyle(feature: Feature, resolution?) {
		const featureId = feature.getId();

		let style = this._styleCache[featureId];
		if (!style) {
			style = new Style({
				stroke: new Stroke({
					color: this.strokeColor,
					width: 3
				}),
				fill: new Fill({
					color: this.fillColor
				})
				//,add text here
			});
			this._styleCache[featureId] = style;
		}
		return style;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const logicalEntitiesCopy = [...logicalEntities];
		const view = this._imap.mapObject.getView();
		const projection = view.getProjection();

		const featuresArray = [];
		const featuresCollectionToAdd: GeoJSON.FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: featuresArray
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity) => {
			const existingEntity = this._idToEntity.get(entity.id);
			if (existingEntity) {
				const newGeometry = this._default4326GeoJSONFormat.readGeometry(entity.featureJson.geometry, {
					dataProjection: 'EPSG:4326',
					featureProjection: projection.getCode()
				});
				existingEntity.feature.setGeometry(newGeometry);
				existingEntity.originalEntity = entity;
			} else {
				const clonedFeatureJson = { ...entity.featureJson };
				clonedFeatureJson.id = entity.id;
				featuresCollectionToAdd.features.push(clonedFeatureJson);
				this._idToEntity.set(entity.id, { originalEntity: entity, feature: null });
			}
		});

		const featuresCollectionGeojson = JSON.stringify(featuresCollectionToAdd);
		const features = this._default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		features.forEach((feature: Feature) => {
			const id: string = <string>feature.getId();
			const existingEntity = this._idToEntity.get(id);
			this._idToEntity.set(id, { ...existingEntity, feature: feature });
		});
		this._source.addFeatures(features);
	}

	setEntities(logicalEntities: IVisualizerEntity[]) {
		const removedEntities = [];
		this._idToEntity.forEach(((value, key: string) => {
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
		const entityToRemove = this._idToEntity.get(logicalEntityId);
		if (entityToRemove) {
			this._idToEntity.delete(logicalEntityId);
			this._source.removeFeature(entityToRemove.feature);
		}
	}

	clearEntities() {
		this._idToEntity.clear();
		this._source.clear(true);
	}

	getEntites(): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		this._idToEntity.forEach((val, key) => entities.push(val.originalEntity));
		return entities;
	}

	onResetView() {
		const currentEntities: IVisualizerEntity[] = this.getEntites();
		this.clearEntities();
		this.createLayer();
		this.addOrUpdateEntities(currentEntities);
	}

	dispose() {
		this.onDisposedEvent.emit();
		this.subscribers.forEach(sub => sub.unsubscribe());
		this.subscribers = [];
	}

	setHoverFeature(id: string) {

	}

	setStyleOptions(strokeColor: string, fillColor: string, containerLayerOpacity: number) {
		this.strokeColor = strokeColor;
		this.fillColor = fillColor;
		this.containerLayerOpacity = containerLayerOpacity;
		this._styleCache = {};
		this._imap.mapObject.render();
	}
}
