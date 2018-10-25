export const TBOverlaySourceConfig = 'tbOverlaysSourceConfig';

export interface ITBOverlaySourceConfig {
	baseUrl: string;
}

export class TBOverlay{
	worldName: string;
	fileName: string;
	fileType: string;
	sensorName: string;
	format: string;
	extension: string;
	fileCreated: string;
	layerUpload: string;
	fileAffiliation:string;
	folderPath: string;
}