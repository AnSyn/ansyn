export interface AnnotationsContextMenuEvent {
	featureId: string;
	pixels: {
		top: number,
		left: number,
		width: number,
		height: number
	};
}

export type AnnotationMode = 'Point' | 'LineString' | 'Polygon'| 'Circle' | 'Rectangle' | 'Arrow' | undefined;
