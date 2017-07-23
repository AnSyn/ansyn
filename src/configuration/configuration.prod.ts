// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { defaultCase } from './cases/default_case';

export const configuration = {
	env: 'production',
	production: false,
	General: {
		logActions: false
	},
	CasesConfig: {
		casesBaseUrl: 'http://localhost' + ':9001/api/v1/cases',
		casesPaginationLimit: 15,
		defaultCase,
		casesQueryParamsKeys: ['facets', 'time', 'maps', 'region'],
		updateCaseDebounceTime: 700,
		useHash: true
	},
	LayersManagerConfig: {
		layersByCaseIdUrl: 'http://localhost' + ':9001/api/v1/layers'
	},
	OverlaysConfig: {
		baseUrl: 'http://localhost' +':9001/api/v1/',
		overlaysByCaseId:  'case/:id/overlays',
		overlaysByTimeAndPolygon : 'overlays/find',
		defaultApi: 'overlays',
		searchByCase: false,
		overlaySource: 'IDAHO',
		polygonGenerationDisatnce: 0.1,
	},
	ImageryConfig: {
		geoMapsInitialMapSource: [{
			// mapType: 'openLayersMap',
			// mapSource: 'OSM',
			// mapSourceMetadata: null

			mapType: 'openLayersMap',
			mapSource: 'BING',
			mapSourceMetadata: { key: "AsVccaM44P5n-GYKXaV0oVGdTI665Qx_sMgYBSYRxryH2pLe92iVxUgEtwIt8des", styles: [/*'Road', */'Aerial'/*, 'AerialWithLabels', 'collinsBart', 'ordnanceSurvey'*/]}

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
			auth: "elastic:changeme"
		},
			{
				uri: 'http://localhost:9001/api/v1/',
				bucket: 'contexts',
				type: "Proxy",
				available: true

			}]
	}
};



/*
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

*/
