import { defaultCase } from './cases/default_case';

export const configuration = {
	env: 'default',
	production: false,
	MetaConfig: {

	},
	General: {
		logActions: false
	},
	CasesConfig: {
		casesBaseUrl: 'http://localhost:9001/api/v1/cases',
		casesPaginationLimit: 15,
		defaultCase,
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region'],
		updateCaseDebounceTime: 700,
		useHash: true
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
		overlaySource: 'IDAHO',
		polygonGenerationDisatnce: 0.1,//in kilometers
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			// mapType: 'openLayersMap',
			// mapSource: 'OSM',
			// mapSourceMetadata: null

			mapType: 'openLayersMap',
			mapSource: 'MapBox',
			mapSourceMetadata: { imageUrl: "https://api.mapbox.com/styles/v1/ansyn/cj6x6ya4k116n2sn1r8scuyzc/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5zeW4iLCJhIjoiY2o2eDZ4b3QyMjI2eTMzbzNzMnk3N2RuZSJ9.SyvUIW3Bi5dA1-RwdzPWcQ"}

			// mapType: 'openLayersMap',
			// mapSource: 'TileWMS',
			// mapSourceMetadata: {
			// 	url: 'http://localhost:8080/geoserver/ansyn/wms',
			// 	projection: 'EPSG:4326',
			// 	layers: ['ansyn:israel_center_1',
			// 			 'ansyn:israel_center_2'
			// 	]}
		}, {
			mapType: 'cesiumMap',
			mapSource: 'OSM',
			mapSourceMetadata: null
		}]
	},
	FiltersConfig: {
		filters: [
			{ modelName: 'sensorType', displayName: 'Sensor Type', type: 'Enum' },
			{ modelName: 'sensorName', displayName: 'Sensor Name', type: 'Enum' }
		]
	},
	ContextConfig: {
		contextSources: [{
			type: 'Elastic',
			uri: 'localhost:9200',
			bucket: 'context',
			available: true,
			log: 'trace',
			auth: "elastic:changeme",
			apiObject: "none"
		},
			{
				uri: 'http://localhost:9001/api/v1/',
				bucket: 'contexts',
				type: "Proxy",
				available: true,
				apiObject: "Http"

			}]
	},
	ToolsConfig: {
		GoTo: {
			from: {
				datum: 'wgs84',
				projection: 'geo'
			},
			to: {
				datum: 'ed50',
				projection: 'utm'
			},
		}
	}
};
