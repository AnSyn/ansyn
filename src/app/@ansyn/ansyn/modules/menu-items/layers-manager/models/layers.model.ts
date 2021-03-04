import { IEntity } from '../../../core/services/storage/storage.service';
import { IEntitiesTableData, ITableRowModel } from '../../../core/models/IEntitiesTableModel';

export enum LayerType {
	static = 'Static',
	annotation = 'Annotation',
	base = 'Base'
}

export type layerPluginType = string | layerPluginTypeEnum;

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

export interface ILayersEntities {
	type: string;
	data: IEntitiesTableData<ILayer>;
}
