import { AnsynBuilder } from './ansyn-builder';
import { SetLayoutAction } from 'app/@ansyn/core/index';

const ansynRoot = document.getElementsByTagName('ansyn-root')[0];
if (ansynRoot) {
	ansynRoot.remove();
}
const ansynMap = new AnsynBuilder('ansynMap', '/assets/config/app.config.json');
ansynMap.isReady$.subscribe(() => {
	ansynMap.api.store.dispatch(new SetLayoutAction('layout4'));
	setTimeout(() => {
		ansynMap.api.setOverlayes([
				{
					"id": "1299446_1857818_2018-03-26_101b",
					"footprint": {
						"coordinates": [
							[
								[
									[
										-74.06352023937815,
										40.53434874386154
									],
									[
										-74.15574531413341,
										40.53516414812759
									],
									[
										-74.15540199137955,
										40.56421867665953
									],
									[
										-74.05708293774329,
										40.54758968111826
									],
									[
										-74.06085948803575,
										40.53438136022271
									],
									[
										-74.06352023937815,
										40.53434874386154
									]
								]
							],
							[
								[
									[
										-74.04021720746,
										40.60450240093722
									],
									[
										-74.15458659983913,
										40.623560266957156
									],
									[
										-74.15432910777373,
										40.64717144638966
									],
									[
										-74.03390865185784,
										40.626426620876735
									],
									[
										-74.04021720746,
										40.60450240093722
									]
								]
							],
							[
								[
									[
										-74.01708583691878,
										40.681905400371726
									],
									[
										-74.1535995469218,
										40.705040475278004
									],
									[
										-74.15286998606983,
										40.760356343227365
									],
									[
										-73.99421195844295,
										40.75899107308806
									],
									[
										-74.01708583691878,
										40.681905400371726
									]
								]
							]
						],
						"type": "MultiPolygon"
					},
					"sensorType": "PSOrthoTile",
					"sensorName": "101b",
					"bestResolution": 3.9,
					"name": "1299446_1857818_2018-03-26_101b",
					"imageUrl": "https://tiles.planet.com/data/v1/PSOrthoTile/1299446_1857818_2018-03-26_101b/{z}/{x}/{y}.png?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"thumbnailUrl": "https://api.planet.com/data/v1/item-types/PSOrthoTile/items/1299446_1857818_2018-03-26_101b/thumb?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"date": new Date("2018-03-26T15:10:21.843Z"),
					"photoTime": "2018-03-27T00:25:14Z",
					"azimuth": 0.015707963267948967,
					"sourceType": "PLANET",
					"isGeoRegistered": true
				},
				{
					"id": "20180326_151021_101b",
					"footprint": {
						"type": "MultiPolygon",
						"coordinates": [
							[
								[
									[
										-74.29600919825735,
										40.806518305218304
									],
									[
										-74.31770886732413,
										40.73258400295697
									],
									[
										-74.01661229597796,
										40.68184134932224
									],
									[
										-73.9951699954356,
										40.75580248029278
									],
									[
										-74.29600919825735,
										40.806518305218304
									]
								]
							]
						]
					},
					"sensorType": "PSScene3Band",
					"sensorName": "101b",
					"bestResolution": 3.9,
					"name": "20180326_151021_101b",
					"imageUrl": "https://tiles.planet.com/data/v1/PSScene3Band/20180326_151021_101b/{z}/{x}/{y}.png?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"thumbnailUrl": "https://api.planet.com/data/v1/item-types/PSScene3Band/items/20180326_151021_101b/thumb?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"date": new Date("2018-03-26T15:10:21.325Z"),
					"photoTime": "2018-03-26T23:29:02Z",
					"azimuth": 0.015707963267948967,
					"sourceType": "PLANET",
					"isGeoRegistered": true
				},
				{
					"id": "20180324_150925_102f",
					"footprint": {
						"type": "MultiPolygon",
						"coordinates": [
							[
								[
									[
										-74.2049338400511,
										40.75874303235685
									],
									[
										-74.2267753141065,
										40.68487740617757
									],
									[
										-73.92604750225773,
										40.63380790324691
									],
									[
										-73.904557398294,
										40.707717144113616
									],
									[
										-74.2049338400511,
										40.75874303235685
									]
								]
							]
						]
					},
					"sensorType": "PSScene3Band",
					"sensorName": "102f",
					"bestResolution": 3.9,
					"name": "20180324_150925_102f",
					"imageUrl": "https://tiles.planet.com/data/v1/PSScene3Band/20180324_150925_102f/{z}/{x}/{y}.png?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"thumbnailUrl": "https://api.planet.com/data/v1/item-types/PSScene3Band/items/20180324_150925_102f/thumb?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"date": new Date("2018-03-24T15:09:25.091Z"),
					"photoTime": "2018-03-24T23:23:41Z",
					"azimuth": 0.003490658503988659,
					"sourceType": "PLANET",
					"isGeoRegistered": true
				},
				{
					"id": "1292400_1857818_2018-03-24_102f",
					"footprint": {
						"type": "MultiPolygon",
						"coordinates": [
							[
								[
									[
										-73.95769100050124,
										40.533435479302675
									],
									[
										-74.15574531413341,
										40.53516414812759
									],
									[
										-74.15291290141407,
										40.760356343227365
									],
									[
										-73.88958434920455,
										40.7580808774168
									],
									[
										-73.92601947645778,
										40.63385251105289
									],
									[
										-73.95769100050124,
										40.533435479302675
									]
								]
							]
						]
					},
					"sensorType": "PSOrthoTile",
					"sensorName": "102f",
					"bestResolution": 3.9,
					"name": "1292400_1857818_2018-03-24_102f",
					"imageUrl": "https://tiles.planet.com/data/v1/PSOrthoTile/1292400_1857818_2018-03-24_102f/{z}/{x}/{y}.png?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"thumbnailUrl": "https://api.planet.com/data/v1/item-types/PSOrthoTile/items/1292400_1857818_2018-03-24_102f/thumb?api_key=9f7afec0ebfb4e1ca0bf959a0050545b",
					"date": new Date("2018-03-24T15:09:25.091Z"),
					"photoTime": "2018-03-25T00:06:15Z",
					"azimuth": 0.003490658503988659,
					"sourceType": "PLANET",
					"isGeoRegistered": true
				}
			]
		);
	}, 10000)
	ansynMap.api.shadowMouseProducer$.subscribe(mouser => {
		console.log(mouser)
	})
});
