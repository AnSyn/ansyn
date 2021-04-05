import { IEntity } from '../../../core/services/storage/storage.service';

export enum LayerType {
	static = 'Static',
	annotation = 'Annotation',
	base = 'Base'
}

export type layerPluginType = string | layerPluginTypeEnum;

export const regionLayerId = 'region-layer';
export const regionLayerDefaultName = 'Region';

export enum layerPluginTypeEnum {
	ARCGIS = 'ARCGIS',
	OSM = 'OSM',
	geoJson = 'geoJson',
	Annotations = 'Annotations'
}

export enum LayerFileTypes {
	KML = 'KML',
	GEOJSON = 'GeoJSON'
}

export interface ILayer extends IEntity {
	url?: string;
	name: string;
	type: LayerType | string;
	layerPluginType: layerPluginType;
	data?: any;
	caseId?: string;
	extent?: [number, number, number, number];
	isNonEditable?: boolean;
}

export enum LayerSearchTypeEnum {
	mapView = 'mapView',
	polygonView = 'polygonView'
}
