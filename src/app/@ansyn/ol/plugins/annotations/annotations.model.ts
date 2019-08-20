import olFeature from 'ol/Feature';
import { FeatureCollection, GeometryObject } from 'geojson';

export interface IAnnotationBoundingRect {
	top: string;
	left: string;
	width: string;
	height: string;
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
	Translate = 'Translate'
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
