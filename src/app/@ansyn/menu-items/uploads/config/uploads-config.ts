export const UploadsConfig = 'uploadsConfig';

export interface IUploadsConfig {
	apiUrl: string;
	sensorTypes: string[];
	defaultSensorType: string;
	sharingOptions: string[];
	sensorNames: string[];
	rulesLink: string;
}
