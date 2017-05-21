// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const configuration = {
	env: 'dev',
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
