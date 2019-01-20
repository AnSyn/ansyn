export const droneConfig: any = {
	casesConfig: {
		defaultCase: {
			state: {
				orientation: 'Imagery Perspective',
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
							id: 'af3b94d2-03ff-44e6-9f73-10d386aff493'
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
					fullyChecked: false,
					filters: [
						{
							sensorType: 'Drone Imagery (JPG)',
							providerName: 'TB'
						},
						{
							sensorType: 'Mobile Imagery (JPG)',
							providerName: 'TB'
						},
						{
							sensorType: 'Drone Map (GeoTIFF)',
							providerName: 'TB'
						},
						{
							sensorType: 'Satellite GeoTIFF',
							providerName: 'TB'
						},
						{
							sensorType: 'others',
							providerName: 'TB'
						}
					],
					active: true
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
			}
		}
	},

	mapSourceProvidersConfig: {
		TB: {
			baseUrl: 'http://tb-server.webiks.com/v2/api/ansyn/layers'
		}
	}
};
