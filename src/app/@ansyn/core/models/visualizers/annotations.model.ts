export interface IAnnotationsContextMenuBoundingRect {
	top: number;
	left: number;
	width: number;
	height: number;
	rotation: number;
}

export interface IAnnotationsContextMenuEvent {
	mapId: string;
	featureId: string;
	boundingRect: IAnnotationsContextMenuBoundingRect;
	interactionType: AnnotationInteraction;
}

export type AnnotationMode = 'Point' | 'LineString' | 'Polygon'| 'Circle' | 'Rectangle' | 'Arrow' | undefined;

export enum AnnotationInteraction {
	click = 'click',
	hover = 'hover'
}
