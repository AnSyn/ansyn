import { defaultCase } from './cases/default_case';

export const configuration = {
	env: 'default',
	production: false,
	General: {
		logActions: true
	},
	CasesConfig: {
		casesBaseUrl: 'http://localhost:9001/api/v1/cases',
		casesPaginationLimit: 15,
		defaultCase,
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region'],
		updateCaseDebounceTime: 700
	},
	LayersManagerConfig: {
		layersByCaseIdUrl: 'http://localhost:9001/api/v1/cases'
	},
	OverlaysConfig: {
		baseUrl: 'http://localhost:9001/api/v1/',
		overlaysByCaseId:  'case/:id/overlays',
		overlaysByTimeAndPolygon : 'overlays/find',
		defaultApi: 'overlays',
		searchByCase: false,
		overlayeSource: 'IDAHO',
		polygonGenerationDisatnce: 0.1,//in kilometers
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			mapType: 'openLayersMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
			// mapType: 'openLayersMap',
			// mapSource: 'TileWMS',
			// mapSourceMetadata: [{url: 'http://localhost:8080/geoserver/ansyn/wms', layerName: 'ansyn:israel_center_1'}]
		}, {
			mapType: 'cesiumMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}]
	}
};
