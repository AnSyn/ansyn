export const defaultCase = {
	id: '1234-5678',
	name: 'Default case',
	state: {
		maps: {
			layouts_index: 0,
			active_map_id: 'default_imagery1',
			data: [{
				'id': 'default_imagery1',
				'mapType': 'openLayersMap',
				'data': {
					'position': {
						'center': {
							'type': 'Point',
							'coordinates': [
								-74.07608662469286,
								40.71400637493053
							]
						},
						'zoom': 4,
						'rotation': 6.287545840111019
					}
				}
			}
			]
		},
		'region': {
			'type': 'Polygon',
			'coordinates': [
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
		'time': {
			'type': 'absolute',
			'from': new Date(new Date().getTime() - 3600000 * 24 * 365).toISOString(),
			'to': new Date().toISOString()
		},
		facets: {
			filters: []
		},
		geoFilter: 'pin-point',
		orientation: 'original',
		favoritesOverlays: []
	}
};
