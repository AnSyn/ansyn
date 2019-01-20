export interface IUploadsConfig {
	apiUrl: string;
	sensorTypes: string[];
	defaultSensorType: string;
	defaultSharing: string;
	sensorNames: string[];
	rulesLink: string;
}

export const uploadConfig: IUploadsConfig = {
	apiUrl: 'http://tb-server.webiks.com/v1/api/ansyn/upload',
	sensorTypes: ['Drone Imagery (JPG)', 'Mobile Imagery (JPG)', 'Drone Map (GeoTIFF)', 'Satellite GeoTIFF'],
	sensorNames: ['Phantom 3', 'Phantom 4', 'Phantom 4 Advanced', 'Phantom 4 Pro', 'Mavic', 'Mavic Pro', 'Mavic 2', 'Spark', 'Inspire'],
	defaultSharing: 'Public',
	defaultSensorType: 'Drone Imagery (JPG)',
	rulesLink: 'https://creativecommons.org/licenses/by/4.0/'
};
