import { Case } from '@ansyn/menu-items/cases/models/case.model';

export const defaultCase: Case = {
	id: '1234-5678',
	name: 'Default case',
	"state": {
		"maps": {
			"layouts_index": 0,
			"active_map_id": "imagery1",
			"data": [
				{
					"id": "imagery1",
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
			"type": 'Point',
			"coordinates": [
				17.1432839938,
				47.800388503457015
			]
		},
		"time": {
			"type": "absolute",
			"from": new Date("2013-06-27T08:43:03.624Z"),
			"to": new Date("2015-04-17T03:55:12.129Z")
		}
	}
};
