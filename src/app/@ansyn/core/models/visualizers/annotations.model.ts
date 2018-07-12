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
}

export type AnnotationMode = 'Point' | 'LineString' | 'Polygon'| 'Circle' | 'Rectangle' | 'Arrow' | undefined;
