export const TBOverlaySourceConfig = 'tbOverlaysSourceConfig';

export interface ITBOverlaySourceConfig {
	baseUrl: string;
}

export class TBOverlay{
	worldName: string;
	fileName: string;
	fileType: string;
	sensorType: string;
	sensorName: string;
	format: string;
	gps: object;
	extension: string;
	fileCreated: string;
	layerUpload: string;
	fileAffiliation:string;
	folderPath: string;
}