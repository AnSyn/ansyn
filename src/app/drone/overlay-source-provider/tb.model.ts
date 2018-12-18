import { Feature, Polygon } from 'geojson';

export interface ITBConfig {
	baseUrl: string;
}

export interface ITBOverlay {
	_id: string,
	displayUrl: string;
	name: string;
	fileName: string;
	fileType: 'image';
	createdDate: number
	geoData: {
		footprint: Feature<Polygon>,
		centerPoint: [number, number],
		bbox: [number, number, number, number]
	};
	imageData: {
		Make: string,
		Model: string,
		ExifImageHeight: number;
		ExifImageWidth: number;
		thumbnailUrl: string;
	},
	inputData: {
		sensor: {
			type: string;
			name: string;
			maker: string;
		};
		ansyn: {
			title: string;
		};
		name: string;
	};
}
