export const configuration = {
	env: 'int',
	production: false,
	MetaConfig: {

	},
	CasesConfig: {
		casesBaseUrl: 'http://localhost:9001/api/v1/cases',
		updateCaseDebounceTime: 700
	},
	LayersManagerConfig: {
		layersByCaseIdUrl: 'http://localhost:9001/api/v1/layers'
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
	},
	ContextConfig: {
		contextSources: [	{
			type: 'Elastic',
			uri: 'localhost:9200',
			bucket: 'context',
			available: true,
			log: 'trace',
			auth: "elastic:changeme",
			apiObject: 'direct'
		},
			{
				uri: 'http://localhost:9001/api/v1/',
				bucket: 'contexts',
				type: "Proxy",
				available: true,
				apiObject: "Http"

			}]
	}
};

