export const configuration = {
	production: false,
	CasesConfig: {
		casesBaseUrl: 'http://localhost:9001/api/v1/cases',
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
		overlaySource: 'IDAHO'
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			mapType: 'openLayersMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}, {
			mapType: 'cesiumMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}]
	}

};

