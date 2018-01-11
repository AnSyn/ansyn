export interface AnnotationsContextMenuEvent {
	featureId: string;
	pixels: {
		top: number,
		left: number,
		width: number,
		height: number
	};
}
