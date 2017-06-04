/**
 * Created by AsafMas on 10/05/2017.
 */
import { Component, OnInit } from '@angular/core';
import { ImageryCommunicatorService, IMapPlugin } from '@ansyn/imagery';
import * as ol from 'openlayers';
import * as turf from '@turf/turf';

@Component({
	selector: 'ansyn-map-sand-box',
	templateUrl: './imagery-sand-box.component.html'
})
export class ImagerySandBoxComponent implements OnInit {

	constructor(private imageryCommunicatorService: ImageryCommunicatorService) {
	}

	public ngOnInit() {
	}

	public setCenter(coordinate) {
		console.log(`'setCenter: lat: ${coordinate.lat}, long: ${coordinate.long}'`);

		try {
			const lat = parseFloat(coordinate.lat);
			const long = parseFloat(coordinate.long);

			const geoPoint: GeoJSON.Point = {
				type: 'Point',
				coordinates: [long, lat]
			};
			this.imageryCommunicatorService.provideCommunicator('imagery1').setCenter(geoPoint, coordinate.animation);
		} catch (ex) {
			throw new Error(`setCenter failed ${ex}`);
		}
	}

	public setWorldLayer() {
		console.log(`'setWorldLayer'`);

		//try {
		const mapTileLayr = new ol.layer.Tile({
			source: new ol.source.OSM()
		});
		const footprint:GeoJSON.MultiPolygon = {"type":"MultiPolygon","coordinates":[[[[35.66132962,32.71470156],[35.84337173,32.71244083],[35.84258139,32.5720059],[35.6607346,32.57504756],[35.66132962,32.71470156]]]],"bbox":[35.6607346,32.5720059,35.84337173,32.71470156]};

		const a: GeoJSON.Feature<any> = {
			"type": 'Feature',
			"properties": {},
			"geometry": footprint
		};
		const center = turf.center(a);
		const bbox = turf.bbox(a);
		const bboxPolygon = turf.bboxPolygon(bbox);
		const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
		this.imageryCommunicatorService.provideCommunicator('imagery1').setLayer(mapTileLayr, extent);
		// } catch (ex) {
		// 	throw new Error(`setWorldLayer failed ${ex}`);
		// }
	}

	public addImageLayer() {
		console.log(`addImageLayer`);

		try {
			const layer = this.createImageLayer();
			this.imageryCommunicatorService.provideCommunicator('imagery1').addLayer(layer);
		} catch (ex) {
			throw new Error(`addImageLayer failed ${ex}`);
		}
	}

	public setImageLayer() {
		console.log(`setImageLayer`);

		// try {
		const layer = this.createImageLayer();

		const footprint:GeoJSON.MultiPolygon = {"type":"MultiPolygon","coordinates":[[[[35.66132962,32.71470156],[35.84337173,32.71244083],[35.84258139,32.5720059],[35.6607346,32.57504756],[35.66132962,32.71470156]]]],"bbox":[35.6607346,32.5720059,35.84337173,32.71470156]};

		const a: GeoJSON.Feature<any> = {
			"type": 'Feature',
			"properties": {},
			"geometry": footprint
		};

		const center = turf.center(a);
		const bbox = turf.bbox(a);
		const bboxPolygon = turf.bboxPolygon(bbox);
		const extent = {topLeft: bboxPolygon.geometry.coordinates[0][0], topRight: bboxPolygon.geometry.coordinates[0][1], bottomLeft: bboxPolygon.geometry.coordinates[0][2], bottomRight:bboxPolygon.geometry.coordinates[0][3]};
		this.imageryCommunicatorService.provideCommunicator('imagery1').setLayer(layer, extent);
		// } catch (ex) {
		// 	throw new Error(`setImageLayer failed ${ex}`);
		// }
	}

	private createImageLayer(): ol.layer.Tile {
		const projection = new ol.proj.Projection({
			code: 'EPSG:4326',
			units: 'degrees',
			axisOrientation: 'neu',
			global: true
		});

		const tiled = new ol.layer.Tile({
			visible: true,
			source: new ol.source.TileWMS({
				url: 'http://localhost:8080/geoserver/ansyn/wms',
				params: {
					'FORMAT': 'image/png',
					'VERSION': '1.1.1',
					tiled: true,
					STYLES: '',
					LAYERS: 'ansyn:israel_center_1',
					tilesOrigin: 34.19140208322269 + ',' + 30.666856822816754
				},
				projection: projection
			})
		});
		return tiled;
	}

	public setActiveMap(mapType: string) {
		this.imageryCommunicatorService.provideCommunicator('imagery1').setActiveMap(mapType);
	}

	private toggleDrawCenterPluggin() {
		const plugin: IMapPlugin = this.imageryCommunicatorService.provideCommunicator('imagery1').getPlugin("openLayerCenterMarker");
		plugin.isEnabled = !plugin.isEnabled;
	}
}
