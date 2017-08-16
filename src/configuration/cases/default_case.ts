//import { Case } from '@ansyn/menu-items/cases/models/case.model';

export const defaultCase = {
	id: '1234-5678',
	name: 'Default case',
	state: {
		maps: {
			layouts_index: 0,
			active_map_id: "default_imagery1",
			data: [{
				"id": "default_imagery1",
				"mapType": "openLayersMap",
				"data": {
					"position": {
						"center": {
							"type": 'Point',
							"coordinates": [
								-74.07608662469286,
								40.71400637493053
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
		facets: {
			filters: []
		},
		geoFilter: 'pin-point',
		orientation: 'original',
		favoritesOverlays: [],
		dataLayers: [{
			"id": "25a6362b-5b4c-45a0-9b7a-17a0fda04c59",
			"name": "OSM",
			"type": "Static",
			"isChecked": false,
			"children": [
				{
					"id": "b78adfbe-8c2f-461b-b531-2df05257fc08",
					"name": "OpenSeaMap",
					"url": "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
					"isChecked": false,
					"source": "OSM",
					"children": []
				},
				{
					"id": "bdb5d3e2-750a-4a5d-93ee-cbdb05273e7b",
					"name": "OpenRailwayMap",
					"url": "http://{a-c}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
					"isChecked": false,
					"source": "OSM",
					"children": []
				},
				{
					"id": "c7661d18-2c25-4696-b831-ea6c4421eab1",
					"name": "Hike & Bike Map",
					"url": "http://{a-c}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png",
					"isChecked": false,
					"source": "OSM",
					"children": []
				}
			]
		}]
	}
};
