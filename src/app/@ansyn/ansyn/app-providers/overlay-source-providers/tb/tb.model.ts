import { Feature, Polygon } from 'geojson';

export interface ITBConfig {
	baseUrl: string;
}

export interface ITBOverlay {
	_id: string,
	imageUrl: string;
	name: string;
	fileName: string;
	filePath: string;
	fileType: 'image';
	format: 'JPEG';
	geoData: {
		footprint: Feature<Polygon>,
		centerPoint: [number, number],
		bbox: [number, number, number, number]
	};
	fileData: {
		lastModified: number
	},
	imageData: {
		Make: string,
		Model: string,
	},
	inputData: {
		sensor: {
			type: string,
			name: string,
			maker: string
		},
		ansyn: {
			title: string
		},
		fileName: string,
		affiliation: string,
		GSD: number,
		flightAltitude: 41.567,
		cloudCoveragePercentage: 0
	};
}
