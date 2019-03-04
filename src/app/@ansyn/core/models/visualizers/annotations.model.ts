import { IVisualizerEntityTags } from '@ansyn/core';

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
	showColorPicker?: boolean;
	showWeight?: boolean;
	showCount?: boolean
	tags?: IVisualizerEntityTags
}

export interface IUpdateFeatureEvent {
	featureId: string;
	properties: { [k: string]: any }
}

export type AnnotationMode = 'Point' | 'LineString' | 'Polygon' | 'Circle' | 'Rectangle' | 'Arrow' | undefined;

export enum AnnotationInteraction {
	click = 'click',
	hover = 'hover'
}
