/**
 * Created by AsafMas on 02/08/2017.
 */
import { IMapVisualizer, IMap, IVisualizerEntity } from '@ansyn/imagery';
import * as ol from 'openlayers';

export abstract class BaseVisualizer implements IMapVisualizer {

	type: string;

	protected _imap: IMap;
	protected _mapId: string;
	protected _source: ol.source.Vector;
	protected _default4326GeoJSONFormat: ol.format.GeoJSON;
	protected _idToFeature: Map<string, ol.Feature>;
	protected _idToOriginalEntity: Map<string, IVisualizerEntity>;

	constructor(visualizerType: string ,args: any) {
		this.type = visualizerType;

		this._default4326GeoJSONFormat = new ol.format.GeoJSON({
			defaultDataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:4326'
		});

		this._idToFeature = new Map<string, ol.Feature>();
		this._idToOriginalEntity = new Map<string, IVisualizerEntity>();
	}

	public onInit(mapId: string, map: IMap) {
		this._imap = map;
		this._mapId = mapId;

		this.createOverlaysLayer();
	}

	protected abstract createOverlaysLayer();

	abstract addOrUpdateEntities(logicalEntities: IVisualizerEntity[]);

	protected getPointGeometry(geom: ol.geom.Geometry): ol.geom.Point {
		let result: ol.geom.Point = null;
		const geomType = geom.getType();
		if (geomType === 'Point') {
			result = <ol.geom.Point>geom;
		} else if (geomType === 'Polygon') {
			const polygonGeom = <ol.geom.Polygon>geom;
			result = polygonGeom.getInteriorPoint();
		} else if (geomType === 'MultiPolygon') {
			const multyPolygonGeom = <ol.geom.MultiPolygon>geom;
			const polygonGeom = <ol.geom.Polygon>multyPolygonGeom.getPolygon(0);
			result = polygonGeom.getInteriorPoint();
		}
		else {
			console.error(`'getPointGeometry Not supported Geom Type for ${geomType}'`);
		}
		return result;
	}

	public setEntities(logicalEntities: IVisualizerEntity[]) {
		const removedEntities = [];
		this._idToFeature.forEach(((value, key: string) => {
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

	public removeEntity(logicalEntityId: string) {
		const fetureToRemove = this._idToFeature.get(logicalEntityId);
		if (fetureToRemove) {
			this._idToFeature.delete(logicalEntityId);
			this._idToOriginalEntity.delete(logicalEntityId);
			this._source.removeFeature(fetureToRemove);
		}
	}

	public clearEntities() {
		this._idToFeature.clear();
		this._idToOriginalEntity.clear();
		this._source.clear(true);
	}

	public getEntites(): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		this._idToOriginalEntity.forEach( (val, key) => entities.push(val));
		return entities;
	}

	public onSetView() {
		const currentEntities: IVisualizerEntity[] = this.getEntites();
		this.clearEntities();
		this.createOverlaysLayer();
		this.addOrUpdateEntities(currentEntities);
	}

	abstract dispose();
}
