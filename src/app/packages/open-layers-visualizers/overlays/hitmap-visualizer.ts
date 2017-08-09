/**
 *
 * Created by AsafMas on 02/08/2017.
 */
import { IVisualizerEntity } from '@ansyn/imagery';
import * as ol from 'openlayers';
import { BaseVisualizer } from '../base-visualizer';

export const FootprintHitmapVisualizerType = 'FootprintHitmapVisualizer';

export class FootprintHitmapVisualizer extends BaseVisualizer {

	private _featuresCollection:ol.Feature[];
	private _footprintsVector: ol.layer.Vector;

	private _styleCache: any;

	constructor(args: any) {
		super(FootprintHitmapVisualizerType, args);
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
			style: this.footprintFeatureStyle.bind(this),
			opacity: 0.5
		});

		this._imap.addLayer(this._footprintsVector);
	}

	private footprintFeatureStyle(feature: ol.Feature, resolution) {
		const featureId = feature.getId();

		let style = this._styleCache[featureId];
		if (!style) {
			style = new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'rgba(0, 0, 0, 0.02)',
					width: 3
				}),
				fill: new ol.style.Fill({
					color: 'rgba(255, 0, 0, 0.05)'
				})
				//,add text here
			});
			this._styleCache[featureId] = style;
		}
		return style;
	}
}
// import { IVisualizerEntity } from '@ansyn/imagery';
// import * as ol from 'openlayers';
// import { BaseVisualizer } from '../base-visualizer';
//
// export const FootprintHitmapVisualizerType = 'FootprintHitmapVisualizer';
//
// export class FootprintHitmapVisualizer extends BaseVisualizer {
//
// 	private _featuresCollection:ol.Feature[];
// 	private _footprintsVector: ol.layer.Vector;
//
// 	constructor(args: any) {
// 		super(FootprintHitmapVisualizerType, args);
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
// 				// Update existing features
// 				// transform Geometry From 4326 to Layer projection
// 				const newGeometry = this._default4326GeoJSONFormat.readGeometry(entity.featureJson.geometry, {
// 					dataProjection: 'EPSG:4326',
// 					featureProjection: projection.getCode()
// 				});
// 				const pointGeom = this.getPointGeometry(newGeometry);
// 				existingFeature.setGeometry(pointGeom);
// 			} else {
// 				// add new features to features collection
// 				entity.featureJson.id = entity.id;
// 				featuresCollectionToAdd.features.push(entity.featureJson);
// 			}
// 		});
//
// 		// transform new entity projection From 4326 to Layer projection
// 		const featuresCollectionGeojson = JSON.stringify(featuresCollectionToAdd);
// 		const features = this._default4326GeoJSONFormat.readFeatures(featuresCollectionGeojson, {
// 			dataProjection: 'EPSG:4326',
// 			featureProjection: projection.getCode()
// 		});
//
// 		// get point features from footprint (HitMap works only with them)
// 		const pointFeatures = features.reduce((previusResult, data: ol.Feature) => {
// 			const result = this.getPointFeature(data);
// 			if (result) {
// 				previusResult.push(result);
// 			}
// 			return previusResult;
// 		}, []);
//
// 		pointFeatures.forEach((feature: ol.Feature)=>{
// 			const id: string = <string>feature.getId();
// 			this._idToFeature.set(id, feature);
// 		});
//
// 		this._source.addFeatures(pointFeatures);
// 	}
//
// 	private getPointFeature(feature: ol.Feature): ol.Feature {
// 		let resultFeature: ol.Feature = null;
// 		const geom = feature.getGeometry();
// 		const pointGeom = this.getPointGeometry(geom);
// 		if (pointGeom) {
// 			resultFeature = new ol.Feature(pointGeom);
// 			const id: string = <string>feature.getId();
// 			resultFeature.setId(id);
// 		}
// 		return resultFeature;
// 	}
//
// 	dispose() {
//
// 	}
//
// 	protected createOverlaysLayer() {
// 		this._featuresCollection = new Array();
// 		this._source = new ol.source.Vector({
// 			features: this._featuresCollection
// 		});
//
// 		this._footprintsVector = new ol.layer.Heatmap({
// 			source: this._source,
// 			weight: '5',
// 			blur: 10,
// 			radius: 10,
// 			visible: true
// 		});
//
// 		this._imap.addLayer(this._footprintsVector);
// 	}
// }
