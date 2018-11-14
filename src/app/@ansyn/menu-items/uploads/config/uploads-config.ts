export const UploadsConfig = 'uploadsConfig';

export interface IUploadsConfig {
	apiUrl: string;
	sensorTypes: string[];
	defaultSensorType: string;
	defaultSharing: string;
	sensorNames: string[];
	rulesLink: string;
}
