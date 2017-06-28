import { Case } from '@ansyn/menu-items/cases/models/case.model';

export const defaultCase: Case = {
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
						-17.2265625,
						27.371767300523047
					],
					[
						45.3515625,
						27.371767300523047
					],
					[
						45.3515625,
						59.93300042374631
					],
					[
						-17.2265625,
						59.93300042374631
					],
					[
						-17.2265625,
						27.371767300523047
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
};
