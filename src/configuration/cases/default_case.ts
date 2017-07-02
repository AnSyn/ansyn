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
						34.573974609375,
						32.27320009948135
					],
					[
						34.5574951171875,
						31.793555207271424
					],
					[
						35.03814697265625,
						31.795889640575172
					],
					[
						35.0244140625,
						32.29177633471201
					],
					[
						34.573974609375,
						32.27320009948135
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
