/**
 * Created by AsafMas on 02/08/2017.
 */
import { IVisualizerEntity } from '@ansyn/imagery';
import * as ol from 'openlayers';
import { BaseVisualizer } from '../base-visualizer';

export const FootprintPolygonVisualizerType = 'FootprintPolygonVisualizer';

export class FootprintPolygonVisualizer extends BaseVisualizer {

	private _featuresCollection:ol.Feature[];
	private _footprintsVector: ol.layer.Vector;

	private _styleCache: any;

	constructor(args: any) {
		super(FootprintPolygonVisualizerType, args);
	}

	public addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		const logicalEntitiesCopy = [...logicalEntities];
		const view = this._imap.mapObject.getView();
		const projection = view.getProjection();

		const featuresArray = new Array();
		const featuresCollectionToAdd: GeoJSON.FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: featuresArray
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity)=> {
			this._idToOriginalEntity.set(entity.id, entity);
			const existingFeature: ol.Feature = this._idToFeature.get(entity.id);
			if (existingFeature) {
				const newGeometry = this._default4326GeoJSONFormat.readGeometry(entity.featureJson.geometry, {
					dataProjection: 'EPSG:4326',
					featureProjection: projection.getCode()
				});
				existingFeature.setGeometry(newGeometry);
			} else {
				entity.featureJson.id = entity.id;
				featuresCollectionToAdd.features.push(entity.featureJson);
			}
		});

		const featuresCollectionGeojson = JSON.stringify(featuresCollectionToAdd);
		const features = this._default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
			dataProjection: 'EPSG:4326',
			featureProjection: projection.getCode()
		});

		features.forEach((feature: ol.Feature)=>{
			const id: string = <string>feature.getId();
			this._idToFeature.set(id, feature);
		});
		this._source.addFeatures(features);
	}

	public dispose() {

	}

	protected createOverlaysLayer() {
		this._featuresCollection = new Array();
		this._source = new ol.source.Vector({
			features: this._featuresCollection
		});

		this._styleCache = {};
		this._footprintsVector = new ol.layer.Vector({
			source: this._source,
			style: this.footprintFeatureStyle.bind(this)
		});

		this._imap.addLayer(this._footprintsVector);
	}

	private footprintFeatureStyle(feature: ol.Feature, resolution) {
		const featureId = feature.getId();

		let style = this._styleCache[featureId];
		if (!style) {
			style = new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'yellow',
					width: 3
				}),
				fill: new ol.style.Fill({
					color: 'transparent'
				})
				//,add text here
			});
			this._styleCache[featureId] = style;
		}
		return style;
	}
}

// /**
//  * Created by AsafMas on 02/08/2017.
//  */
// import { EventEmitter } from '@angular/core';
// import { IMapVisualizer, ImageryCommunicatorService, IMap, IVisualizerEntity } from '@ansyn/imagery';
// import * as ol from 'openlayers';
//
// export const FootprintPolygonVisualizerType = 'FootprintPolygonVisualizer';
//
// export class FootprintPolygonVisualizer implements IMapVisualizer {
//
// 	entityCreated: EventEmitter<any>; // emit{mapId: string, visualizerType: string, createdObject: any}
// 	entityRemoved: EventEmitter<any>; // emit{mapId: string, visualizerType: string, createdObject: any}
//
// 	type: string;
//
// 	private _featuresCollection:ol.Feature[];
// 	private _source: ol.source.Vector;
// 	private _footprintsVector: ol.layer.Vector;
//
// 	private _styleCache: any;
// 	private _imap: IMap;
// 	private _mapId: string;
// 	private _default4326GeoJSONFormat: ol.format.GeoJSON;
// 	private _idToFeature: Map<string, ol.Feature>;
// 	private _idToOriginalEntity: Map<string, IVisualizerEntity>;
//
// 	constructor(args: any) {
// 		this.type = FootprintPolygonVisualizerType;
//
// 		this.entityCreated = new EventEmitter<any>();
// 		this.entityRemoved = new EventEmitter<any>();
//
// 		this._default4326GeoJSONFormat = new ol.format.GeoJSON({
// 			defaultDataProjection: 'EPSG:4326',
// 			featureProjection: 'EPSG:4326'
// 		});
//
// 		this._idToFeature = new Map<string, ol.Feature>();
// 		this._idToOriginalEntity = new Map<string, IVisualizerEntity>();
// 	}
//
// 	public onInit(mapId: string, map: IMap) {
// 		this._imap = map;
// 		this._mapId = mapId;
//
// 		this.createOverlaysLayer();
// 	}
//
// 	public addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
// 		const logicalEntitiesCopy = [...logicalEntities];
// 		const view = this._imap.mapObject.getView();
// 		const projection = view.getProjection();
//
// 		const featuresArray = new Array();
// 		const featuresCollectionToAdd: GeoJSON.FeatureCollection<any> = {
// 			type: 'FeatureCollection',
// 			features: featuresArray
// 		};
//
// 		logicalEntitiesCopy.forEach((entity: IVisualizerEntity)=> {
// 			this._idToOriginalEntity.set(entity.id, entity);
// 			const existingFeature: ol.Feature = this._idToFeature.get(entity.id);
// 			if (existingFeature) {
// 				const newGeometry = this._default4326GeoJSONFormat.readGeometry(entity.featureJson.geometry, {
// 					dataProjection: 'EPSG:4326',
// 					featureProjection: projection.getCode()
// 				});
// 				existingFeature.setGeometry(newGeometry);
// 			} else {
// 				entity.featureJson.id = entity.id;
// 				featuresCollectionToAdd.features.push(entity.featureJson);
// 			}
// 		});
//
// 		const featuresCollectionGeojson = JSON.stringify(featuresCollectionToAdd);
// 		const features = this._default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
// 			dataProjection: 'EPSG:4326',
// 			featureProjection: projection.getCode()
// 		});
//
// 		features.forEach((feature: ol.Feature)=>{
// 			const id: string = <string>feature.getId();
// 			this._idToFeature.set(id, feature);
// 		});
// 		this._source.addFeatures(features);
// 	}
//
// 	public setEntities(logicalEntities: IVisualizerEntity[]) {
// 		const removedEntities = [];
// 		this._idToFeature.forEach(((value, key: string) => {
// 			const item = logicalEntities.find((entity) => entity.id === key);
// 			if (!item) {
// 				removedEntities.push(key);
// 			}
// 		}));
//
// 		removedEntities.forEach((id) => {
// 			this.removeEntity(id);
// 		});
//
// 		this.addOrUpdateEntities(logicalEntities);
// 	}
//
// 	public removeEntity(logicalEntityId: string) {
// 		const fetureToRemove = this._idToFeature.get(logicalEntityId);
// 		if (fetureToRemove) {
// 			this._idToFeature.delete(logicalEntityId);
// 			this._idToOriginalEntity.delete(logicalEntityId);
// 			this._source.removeFeature(fetureToRemove);
// 		}
// 	}
//
// 	public clearEntities() {
// 		this._idToFeature.clear();
// 		this._idToOriginalEntity.clear();
// 		this._source.clear(true);
// 	}
//
// 	public getEntites(): IVisualizerEntity[] {
// 		const entities: IVisualizerEntity[] = [];
// 		this._idToOriginalEntity.forEach( (val, key) => entities.push(val));
// 		return entities;
// 	}
//
// 	public onSetView() {
// 		const currentEntities: IVisualizerEntity[] = this.getEntites();
// 		this.clearEntities();
// 		this.createOverlaysLayer();
// 		this.addOrUpdateEntities(currentEntities);
// 	}
//
// 	dispose() {
//
// 	}
//
// 	private createOverlaysLayer() {
// 		this._featuresCollection = new Array();
// 		this._source = new ol.source.Vector({
// 			features: this._featuresCollection
//
// 		});
//
// 		this._styleCache = {};
// 		this._footprintsVector = new ol.layer.Vector({
// 			source: this._source,
// 			style: this.footprintFeatureStyle.bind(this)
// 		});
//
// 		this._imap.addLayer(this._footprintsVector);
// 	}
//
// 	private footprintFeatureStyle(feature: ol.Feature, resolution) {
//
// 		const featureId = feature.getId();
//
// 		let style = this._styleCache[featureId];
// 		if (!style) {
// 			style = new ol.style.Style({
// 				stroke: new ol.style.Stroke({
// 					color: 'yellow',
// 					width: 3
// 				}),
// 				fill: new ol.style.Fill({
// 					color: 'transparent'
// 				})
// 				//,add text here
// 			});
// 			this._styleCache[featureId] = style;
// 		}
// 		return style;
// 	}
// }
