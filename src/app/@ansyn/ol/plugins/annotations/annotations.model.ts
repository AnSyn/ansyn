import olFeature from 'ol/Feature';
import { FeatureCollection, GeometryObject } from 'geojson';

export interface IAnnotationBoundingRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

export interface IAnnotationsSelectionEventData {
	label: string
	featureId: string;
	type: string,
	mapId: string;
	style: any;
	boundingRect: IAnnotationBoundingRect;
	interactionType?: AnnotationInteraction;
	showLabel?: boolean;
	showMeasures?: boolean;
	showColorPicker?: boolean,
	showWeight?: boolean
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
