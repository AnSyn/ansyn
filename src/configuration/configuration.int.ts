export const configuration = {
	env: 'int',
	production: false,
	CasesConfig: {
		casesBaseUrl: 'http://localhost:9001/api/v1/cases'
	},
	LayersManagerConfig: {
		layersByCaseIdUrl: 'http://localhost:9001/api/v1/cases'
	},
	OverlaysConfig: {
		baseUrl: 'http://localhost:9001/api/v1/',
		overlaysByCaseId:  'case/:id/overlays',
		overlaysByTimeAndPolygon : 'overlays/find',
		defaultApi: 'overlays'
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			mapType: 'openLayerMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}, {
			mapType: 'cesiumMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}]
	}
};

