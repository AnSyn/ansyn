export const configuration = {
	env: 'default',
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
		defaultApi: 'overlays'
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			mapType: 'openLayerMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
			// mapType: 'openLayerMap',
			// mapSource: 'TileWMS',
			// mapSourceMetadata: [{url: 'http://localhost:8080/geoserver/ansyn/wms', layerName: 'ansyn:israel_center_1'}]
		}, {
			mapType: 'cesiumMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}]
	}
};
