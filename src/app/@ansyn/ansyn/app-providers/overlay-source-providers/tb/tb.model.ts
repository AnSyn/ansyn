import { Feature, Polygon } from 'geojson';

export const TBOverlaySourceConfig = 'tbOverlaysSourceConfig';

export interface ITBOverlaySourceConfig {
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
		Orientation: 1,
		XResolution: 72,
		YResolution: 72,
		ResolutionUnit: 2,
		Software: string,
		ModifyDate: 1539789376,
		GPSLatitudeRef: 'N',
		GPSLatitude: 32.076565888888894,
		GPSLongitudeRef: 'E',
		GPSLongitude: 34.79505475,
		GPSAltitude: 41.567,
		ExposureTime: 0.002,
		FNumber: 6.3,
		ExposureProgram: 2,
		ISO: 100,
		DateTimeOriginal: 1539789375,
		ShutterSpeedValue: 8.965,
		ApertureValue: 5.31,
		ExposureCompensation: 0,
		MaxApertureValue: 2.97,
		SubjectDistance: 0,
		MeteringMode: 2,
		LightSource: 0,
		Flash: 32,
		FocalLength: 8.8,
		ColorSpace: 1,
		ExifImageWidth: 5472,
		ExifImageHeight: 3078,
		ExposureIndex: 'NaN',
		ExposureMode: 0,
		WhiteBalance: 0,
		DigitalZoomRatio: 'NaN',
		FocalLengthIn35mmFormat: 24,
		SceneCaptureType: 0,
		GainControl: 0,
		Contrast: 0,
		Saturation: 0,
		Sharpness: 0,
		SubjectDistanceRange: 0,
		SerialNumber: '5bd578515cdd2e6a73ebff10a8e8bf1e',
		InteropIndex: 'R98'
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
