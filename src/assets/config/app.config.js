window.settings = Object.freeze({
    	casesConfig: {
            baseUrl: 'http://localhost:9001/api/v1/cases',
            paginationLimit: 15,
            defaultCase: {
                id: '1234-5678',
                name: 'Default case',
                state: {
                    "maps": {
                        "layouts_index": 0,
                        "active_map_id": "default_imagery1",
                        "data": [
                            {
                                "id": "default_imagery1",
                                "mapType": "openLayersMap",
                                "data": {
                                    "position": {
                                        "center": {
                                            "type": 'Point',
                                            "coordinates": [
                                                17.1432839938,
                                                47.800388503457015
                                            ]
                                        },
                                        "zoom": 4,
                                        "rotation": 6.287545840111019
                                    }
                                }
                            }
                        ]
                    },


                    "region": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    -74.09214019775389,
                                    40.73386046245138
                                ],
                                [
                                    -74.10080909729004,
                                    40.69573721839922
                                ],
                                [
                                    -74.05600547790527,
                                    40.694956309550584
                                ],
                                [
                                    -74.05540466308594,
                                    40.73405557647634
                                ],
                                [
                                    -74.09214019775389,
                                    40.73386046245138
                                ]
                            ]
                        ]
                    },
                    "time": {
                        "type": "absolute",
                        "from": new Date(new Date().getTime() - 3600000 * 24 * 365).toISOString(),
                        "to": new Date().toISOString()
                    },
                    "facets": {
                        "filters": [
                            { "fieldName": "sensorType", "metadata": ["WORLDVIEW03_VNIR", "WORLDVIEW02"] },
                            { "fieldName": "sensorName", "metadata": ["Panchromatic"] }
                        ]
                    }
                }
            },
            casesQueryParamsKeys: ['facets', 'time', 'maps', 'region'],
            updateCaseDebounceTime: 700,
            useHash: true
	},
	layersManagerConfig: {
		layersByCaseIdUrl: 'http://localhost:9001/api/v1/layers'
	},
	overlaysConfig: {
		baseUrl: 'http://localhost:9001/api/v1/',
		overlaysByCaseId:  'case/:id/overlays',
		overlaysByTimeAndPolygon : 'overlays/find',
		defaultApi: 'overlays',
		searchByCase: false,
		overlaySource: 'IDAHO',
		polygonGenerationDisatnce: 0.1,
	},
	imageryConfig: {
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
	filtersConfig: {
		filters: [
			{ modelName: 'sensorType', displayName: 'Sensor Type', type: 'Enum' },
			{ modelName: 'sensorName', displayName: 'Sensor Name', type: 'Enum' }
		]
	},
	contextConfig: {
		contextSources: [
			{
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
    },
    toolsConfig: {
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
})