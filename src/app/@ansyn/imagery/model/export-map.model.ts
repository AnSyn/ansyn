export interface IExportMapMetadata {
	size: [number, number];
	resolution: number;
	extra: {
		north: boolean;
		annotations: string | false;
		descriptions: boolean };
}

export interface IExportMapData {
	canvas: HTMLCanvasElement
	compass?: HTMLCanvasElement
}
