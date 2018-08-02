export interface IAnnotationsContextMenuBoundingRect {
	top: number;
	left: number;
	width: number;
	height: number;
	rotation: number;
}

export interface IAnnotationsContextMenuEvent {
	featureId: string;
	mapId: string;
	boundingRect: IAnnotationsContextMenuBoundingRect;
	interactionType?: AnnotationInteraction;
	showMeasures?: boolean;
}

export interface IUpdateFeatureEvent {
	featureId: string;
	properties: { [k: string]: any }
}

export type AnnotationMode = 'Point' | 'LineString' | 'Polygon'| 'Circle' | 'Rectangle' | 'Arrow' | undefined;

export enum AnnotationInteraction {
	click = 'click',
	hover = 'hover'
}
