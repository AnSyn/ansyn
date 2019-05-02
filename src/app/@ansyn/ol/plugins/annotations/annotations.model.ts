import olFeature from 'ol/Feature';
import { FeatureCollection, GeometryObject } from 'geojson';

export interface IAnnotationBoundingRect {
	top: string;
	left: string;
	width: string;
	height: string;
}

export interface IAnnotationsSelectionEventData {
	featureId: string;
	label?: string
	style?: any;
	boundingRect?: () => IAnnotationBoundingRect;
	showMeasures?: boolean;
}

export interface IOnHoverEvent {
	mapId: string;
	data?: IIOnHoverEventData;
}

export interface IIOnHoverEventData {
	boundingRect: IAnnotationBoundingRect;
	style: any;
}

export interface IOnSelectEventData {
	[id: string]: IAnnotationsSelectionEventData;
}

export interface IOnSelectEvent {
	mapId: string;
	multi: true;
	data: IOnSelectEventData;
}

export interface IUpdateFeatureEvent {
	featureId: string;
	properties: { [k: string]: any }
}

export enum AnnotationMode {
	Point = 'Point',
	LineString = 'LineString',
	Polygon = 'Polygon',
	Circle = 'Circle',
	Rectangle = 'Rectangle',
	Arrow = 'Arrow',
}

export const ANNOTATION_MODE_LIST: AnnotationMode[] = Object.values(AnnotationMode);

export enum AnnotationInteraction {
	click = 'click',
	hover = 'hover'
}

export interface IDrawEndEvent {
	GeoJSON: FeatureCollection<GeometryObject>;
	feature: olFeature;
}
