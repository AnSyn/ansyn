export const droneConfig: any = {
	casesConfig: {
		defaultCase: {
			/*state: {
				orientation: 'User Perspective',
				maps: {
					data: [
						{
							data: {
								position: {
									extentPolygon: {
										type: 'Polygon',
										coordinates: [
											[
												[
													30.228881835937493,
													33.79284377363183
												],
												[
													40.28137207031249,
													33.79284377363183
												],
												[
													40.28137207031249,
													29.93113480986871
												],
												[
													30.228881835937493,
													29.93113480986871
												],
												[
													30.228881835937493,
													33.79284377363183
												]
											]
										]
									},
									projectedState: {
										center: [
											3924635.821280659,
											3747762.3000904336
										],
										projection: {
											code: 'EPSG:3857'
										},
										resolution: 611.49622628141,
										rotation: 0,
										zoom: 8
									}
								}
							},
							flags: {},
							worldView: {
								mapType: 'openLayersMap',
								sourceType: 'BING'
							},
							id: null
						}
					]
				},
				region: {
					type: 'Polygon',
					coordinates: [
						[
							[
								35.040894,
								33.050112
							],
							[
								35.738525,
								33.128351
							],
							[
								34.969482,
								29.53045
							],
							[
								34.222412,
								31.438037
							],
							[
								35.040894,
								33.050112
							]
						]
					]
				},
				dataInputFilters: {
					filters: [],
					active: false
				},
				facets: {
					filters: [
						{
							fieldName: 'isGeoRegistered',
							metadata: {
								displayTrue: true,
								displayFalse: true
							},
							type: 'Boolean'
						}
					]
				}
			}*/
			state: {
				orientation: 'User Perspective',
				maps: {
					"layout": "layout1",
					"data": [
						{
							"data": {
								"position": {
									"extentPolygon": {
										"type": "Polygon",
										"coordinates": [
											[
												[
													-122.63900756835936,
													37.84463035606055
												],
												[
													-122.63900756835936,
													37.84463035606055
												],
												[
													-122.01072692871092,
													37.84463035606055
												],
												[
													-122.01072692871092,
													37.84463035606055
												],
												[
													-122.63900756835936,
													37.84463035606055
												]
											]
										]
									},
									"projectedState": {
										"center": [
											-13617154.942976804,
											4541696.481191917
										],
										"projection": {
											"code": "EPSG:3857"
										},
										"resolution": 38.21851414258813,
										"rotation": 0,
										"zoom": 12
									}
								},
								"overlay": null,
								"isAutoImageProcessingActive": false,
								"imageManualProcessArgs": {
									"Sharpness": 0,
									"Contrast": 0,
									"Brightness": 0,
									"Gamma": 100,
									"Saturation": 100
								}
							},
							"flags": {},
							"worldView": {
								"mapType": "openLayersMap",
								"sourceType": "BING"
							},
							"id": null
						}
					],
				},
				"time": {
					"type": "absolute",
					"from": new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
					"to": new Date().toISOString(),
				},
				region: {
					"type": "Polygon",
					"coordinates": [
						[
							[
								-122.54287719726564,
								37.80883459900416
							],
							[
								-122.36709594726564,
								37.806935854373705
							],
							[
								-122.35439300537111,
								37.684771285715314
							],
							[
								-122.55008697509767,
								37.68205422759398
							],
							[
								-122.54287719726564,
								37.80883459900416
							]
						]
					]
				},
				dataInputFilters: {
					"fullyChecked": true,
					"filters": [
						{
							"sensorType": "REScene",
							"providerName": "PLANET"
						},
						{
							"sensorType": "PSScene3Band",
							"providerName": "PLANET"
						},
						{
							"sensorType": "PSOrthoTile",
							"providerName": "PLANET"
						},
						{
							"sensorType": "REOrthoTile",
							"providerName": "PLANET"
						},
						{
							"sensorType": "SkySatScene",
							"providerName": "PLANET"
						},
						{
							"sensorType": "Landsat8L1G",
							"providerName": "PLANET"
						},
						{
							"sensorType": "Sentinel2L1C",
							"providerName": "PLANET"
						},
						{
							"sensorType": "others",
							"providerName": "PLANET"
						},
						{
							"sensorType": "UAV",
							"providerName": "OPEN_AERIAL"
						},
						{
							"sensorType": "PHR1A",
							"providerName": "AIRBUS"
						},
						{
							"sensorType": "PHR1B",
							"providerName": "AIRBUS"
						},
						{
							"sensorType": "SPOT6",
							"providerName": "AIRBUS"
						},
						{
							"sensorType": "SPOT7",
							"providerName": "AIRBUS"
						},
						{
							"sensorType": "Drone Imagery (JPG)",
							"providerName": "TB"
						},
						{
							"sensorType": "Mobile Imagery (JPG)",
							"providerName": "TB"
						},
						{
							"sensorType": "Drone Map (GeoTIFF)",
							"providerName": "TB"
						},
						{
							"sensorType": "Satellite GeoTIFF",
							"providerName": "TB"
						},
						{
							"sensorType": "others",
							"providerName": "TB"
						}
					],
					"active": true
				},
				facets: {
					"showOnlyFavorites": false,
					"filters": [
						{
							"fieldName": "sensorType",
							"metadata": [],
							"type": "Enum"
						},
						{
							"fieldName": "sensorName",
							"metadata": [],
							"type": "Enum"
						},
						{
							"fieldName": "sourceType",
							"metadata": [],
							"type": "Enum"
						},
						{
							"fieldName": "creditName",
							"metadata": [],
							"type": "Enum"
						},
						{
							"fieldName": "isGeoRegistered",
							"metadata": {
								"displayTrue": true,
								"displayFalse": true
							},
							"type": "Boolean"
						},
						{
							"fieldName": "bestResolution",
							"metadata": null,
							"type": "Slider"
						},
						{
							"fieldName": "cloudCoverage",
							"metadata": null,
							"type": "Slider"
						}
					]
				}
			}
		}
	},
	multipleOverlaysSourceConfig: {
		TB: {
			inActive: false,
			whitelist: [
				{
					name: "Entire Earth",
					dates: [
						{
							start: null,
							end: null
						}
					],
					sensorNames: [null],
					coverage: [
						[
							[
								[
									-180,
									-90
								],
								[
									-180,
									90
								],
								[
									180,
									90
								],
								[
									180,
									-90
								],
								[
									-180,
									-90
								]
							]
						]
					]
				}
			],
			blacklist: [],
			dataInputFiltersConfig: {
				text: 'TB',
				value: 1,
				collapsed: true,
				children: [
					{
						text: 'Drone Imagery (JPG)',
						value: {
							sensorType: 'Drone Imagery (JPG)'
						}
					},
					{
						text: 'Mobile Imagery (JPG)',
						value: {
							sensorType: 'Mobile Imagery (JPG)'
						}
					},
					{
						text: 'Drone Map (GeoTIFF)',
						value: {
							sensorType: 'Drone Map (GeoTIFF)'
						}
					},
					{
						text: 'Satellite GeoTIFF',
						value: {
							sensorType: 'Satellite GeoTIFF'
						}
					},
					{
						text: 'Others',
						value: {
							sensorType: 'others'
						}
					}
				]
			}
		}
	},
	filtersConfig: {
		shortFilterListLength: 8,
		filters: [
			{
				"modelName": "sensorType",
				"displayName": "Sensor Type",
				"type": "Enum"
			},
			{
				"modelName": "sensorName",
				"displayName": "Sensor Name",
				"type": "Enum"
			},
			{
				"modelName": "sourceType",
				"displayName": "Source Type",
				"type": "Enum"
			},
			{
				"modelName": "creditName",
				"displayName": "Name for Credit",
				"type": "Enum"
			},
			{
				"modelName": "isGeoRegistered",
				"displayName": "Geo Registration",
				"type": "Boolean",
				"customData": {
					"displayTrueName": "Geo registered",
					"displayFalseName": "Not Geo registered"
				}
			},
			{
				"modelName": "bestResolution",
				"displayName": "Resolution",
				"type": "Slider"
			},
			{
				"modelName": "cloudCoverage",
				"displayName": "Cloud Coverage",
				"type": "Slider"
			}
		]
	},
	coreConfig: {
		translation: {
			default: {
				TB: 'Ramon'
			}
		},
	},
};
