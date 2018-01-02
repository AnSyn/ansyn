export interface AnnotationsContextMenuEvent {
	action: 'openMenu';
	featureId: string;
	geometryName: string;
	pixels: {
		top: number,
		left: number,
		width: number,
		height: number
	};
}
