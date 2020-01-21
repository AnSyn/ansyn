export const Pic4CartoSourceType = 'PIC4CARTO';

export interface IPic4CartoConfig {
	baseUrl: string;
	pointToGeojsonRadius: number;
	providers: string[];
	imageWidth: number,
	imageHeight: number,
	timeLimit: number
}

export interface IPic4CartoParams {
	west: string,		// minX
	north: string,		// maxY
	east: string,		// maxX
	south: string,		// minY
	mindate: string,
	maxdate: string,
	ignore?: string,
	[field: string]: string
}

export interface IPic4CartoPicture {
	pictureUrl: string;
	date: number;
	coordinates: {
		lat: number;
		lng: number;
	},
	provider: string;
	author: string;
	license: string;
	detailsUrl: string;
	direction: any;
}
