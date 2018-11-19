import { Feature, Polygon } from 'geojson';

export const TBOverlaySourceConfig = 'tbOverlaysSourceConfig';

export interface ITBOverlaySourceConfig {
	baseUrl: string;
}

export interface ITBOverlay {
	_id: string,
	displayUrl: string;
	thumbnailUrl: string;
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
