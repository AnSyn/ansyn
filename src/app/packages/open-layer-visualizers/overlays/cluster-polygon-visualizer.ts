// /**
//  * Created by AsafMas on 02/08/2017.
//  */
// import { EventEmitter } from '@angular/core';
// import { IMapVisualizer, ImageryCommunicatorService, IMap, IVisualizerEntity } from '@ansyn/imagery';
// import * as ol from 'openlayers';
//
// export const FootprintClusterPolygonVisualizerType = 'FootprintClusterPolygonVisualizer';
//
// export class FootprintClusterPolygonVisualizer implements IMapVisualizer {
//
// 	entityCreated: EventEmitter<any>; // emit{mapId: string, visualizerType: string, createdObject: any}
// 	entityRemoved: EventEmitter<any>; // emit{mapId: string, visualizerType: string, createdObject: any}
//
// 	type: string;
//
// 	private _featuresCollection: ol.Feature[];
// 	private _source: ol.source.Vector;
// 	private _selectedPolygonSource: ol.source.Vector;
// 	private _clusterSource: ol.source.Cluster;
// 	private _polygonClustersVector: ol.layer.Vector;
// 	private _polygonSelectedVector: ol.layer.Vector;
// 	private _styleCache: any;
// 	private _imap: IMap;
// 	private _mapId: string;
// 	private _default4326GeoJSONFormat: ol.format.GeoJSON;
// 	private _idToFeature: Map<string, ol.Feature>;
// 	private _idToOriginalEntity: Map<string, IVisualizerEntity>;
//
// 	private _highlighttedFeatures: ol.Feature[];
//
// 	private selectedPolygonStyle = new ol.style.Style({
// 		stroke: new ol.style.Stroke({
// 			color: 'red',
// 			width: 3
// 		}),
// 		fill: new ol.style.Fill({
// 			color: 'rgba(0, 0, 255, 0.1)'
// 		}),
// 		zIndex: 99
// 	});
//
// 	constructor(args: any) {
// 		this.type = FootprintClusterPolygonVisualizerType;
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
// 		this.registerToMapClick();
// 	}
//
// 	private registerToMapClick() {
// 		this._imap.mapObject.on('click', (evt)=> {
// 			if (evt.dragging) {
// 				return;
// 			}
// 			const pixel = this._imap.mapObject.getEventPixel(evt.originalEvent);
// 			this.displayFeatureInfo(pixel);
// 		});
// 	}
//
// 	private registerToMapHover() {
// 		this._imap.mapObject.on('pointermove', (evt)=> {
// 			if (evt.dragging) {
// 				return;
// 			}
// 			const pixel = this._imap.mapObject.getEventPixel(evt.originalEvent);
// 			//displayFeatureInfo(pixel);
// 		});
// 	}
//
// 	private displayFeatureInfo(pixel) {
// 		const feature = this._imap.mapObject.forEachFeatureAtPixel(pixel, function(currentfeature) {
// 			return currentfeature;
// 		});
//
// 		if (!feature) {
// 			this._selectedPolygonSource.clear(true);
// 			this._highlighttedFeatures = [];
// 			return;
// 		}
//
// 		// because of cluster
// 		const originalFeatures = feature.get('features');
// 		if (originalFeatures) {
// 			this._selectedPolygonSource.clear()
// 			this._highlighttedFeatures = [];
// 			originalFeatures.forEach((clickedFeature)=>{
// 				this._selectedPolygonSource.addFeature(clickedFeature);
// 				this._highlighttedFeatures.push(clickedFeature);
// 			});
// 		}
// 		// 	&& (originalFeature[0] !== this._highlighttedFeature)) {
// 		// 	if (this._highlighttedFeature) {
// 		// 		this._selectedPolygonSource.removeFeature(this._highlighttedFeature);
// 		// 		this._highlighttedFeature = null;
// 		// 	}
// 		// 	if (originalFeature[0]) {
// 		// 		this._selectedPolygonSource.addFeature(originalFeature[0]);
// 		// 	}
// 		// 	this._highlighttedFeature = originalFeature[0];
// 		// }
// 	};
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
// 	private clusterFunction(feature) {
// 		const originalGeom = feature.getGeometry();
// 		const result = this.getPointGeometry(originalGeom);
// 		return result;
// 	};
//
// 	private getPointGeometry(geom: ol.geom.Geometry): ol.geom.Point {
// 		let result: ol.geom.Point = null;
// 		const geomType = geom.getType();
// 		if (geomType === 'Point') {
// 			result = <ol.geom.Point>geom;
// 		} else if (geomType === 'Polygon') {
// 			const polygonGeom = <ol.geom.Polygon>geom;
// 			result = polygonGeom.getInteriorPoint();
// 		} else if (geomType === 'MultiPolygon') {
// 			const multyPolygonGeom = <ol.geom.MultiPolygon>geom;
// 			const polygonGeom = <ol.geom.Polygon>multyPolygonGeom.getPolygon(0);
// 			result = polygonGeom.getInteriorPoint();
// 		}
// 		else {
// 			console.error(`'Cluster Polygon Map (getPointGeometry) Not supported Geom Type for ${geomType}'`);
// 		}
// 		return result;
// 	}
//
// 	private createOverlaysLayer() {
// 		this._featuresCollection = new Array();
// 		this._source = new ol.source.Vector({
// 			features: this._featuresCollection
//
// 		});
// 		this._clusterSource = new ol.source.Cluster({
// 			distance: 20,
// 			geometryFunction: this.clusterFunction.bind(this),
// 			source: this._source
// 		});
//
// 		this._styleCache = {};
// 		this._polygonClustersVector = new ol.layer.Vector({
// 			source: this._clusterSource,
// 			style: this.clusterFeatureStyleFunction.bind(this)
// 		});
//
// 		this._selectedPolygonSource = new ol.source.Vector({
// 			features: this._featuresCollection
// 		});
//
// 		this._polygonSelectedVector = new ol.layer.Vector({
// 			source: this._selectedPolygonSource,
// 			style: this.selectedPolygonStyle
// 		});
//
// 		this._imap.addLayer(this._polygonClustersVector);
// 		this._polygonSelectedVector.setZIndex(99);
// 		this._imap.addLayer(this._polygonSelectedVector);
// 	}
//
// 	public clusterFeatureStyleFunction(feature, resolution) {
// 		const size = feature.get('features').length;
// 		///
//
// 		// if (this._highlighttedFeatures.indexOf(feature) !== -1) {
//         //
// 		// }
//
// 		///
// 		let style = this._styleCache[size];
// 		if (!style) {
// 			if (size === 1) {
// 				style = new ol.style.Style({
// 					stroke: new ol.style.Stroke({
// 						color: 'blue',
// 						width: 3
// 					}),
// 					fill: new ol.style.Fill({
// 						color: 'rgba(0, 0, 255, 0.1)'
// 					}),
// 					geometry: function(currentFeature){
// 						const originalFeature = currentFeature.get('features');
// 						const geometry = originalFeature[0].getGeometry();
// 						return geometry;
// 					}
// 				});
// 			}
// 			else {//if (size > 1) {
// 				style = new ol.style.Style({
// 					image: new ol.style.Circle({
// 						radius: 10,
// 						stroke: new ol.style.Stroke({
// 							color: '#fff'
// 						}),
// 						fill: new ol.style.Fill({
// 							color: '#3399CC'
// 						})
// 					}),
// 					text: new ol.style.Text({
// 						text: size.toString(),
// 						fill: new ol.style.Fill({
// 							color: '#fff'
// 						})
// 					})
// 				});
// 			}
// 			this._styleCache[size] = style;
// 		}
// 		return style;
// 	}
// }
