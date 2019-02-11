import { Component, OnInit } from '@angular/core';
import { AnsynApi } from '@ansyn/ansyn';
import { Point, Polygon } from 'geojson';
import { IOverlay, IOverlaysCriteria } from '@ansyn/core';
import { OpenLayersStaticImageSourceProviderSourceType } from '@ansyn/plugins';
import * as momentNs from 'moment';
import { take, tap } from 'rxjs/operators';
import { CesiumLayer, ISceneMode } from "../../../@ansyn/plugins/cesium/models/cesium-layer";
import { ImageryCommunicatorService } from "@ansyn/imagery";

const moment = momentNs;

@Component({
	selector: 'ansyn-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.less']
})
export class SandboxComponent implements OnInit {
	overlays = [
		this.overlay('000', 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reeipublic_Banana.gif', 576, 1024),
		this.overlay('111', 'https://image.shutterstock.com/image-vector/cool-comic-book-bubble-text-450w-342092249.jpg', 470, 450),
		this.overlay('222', 'https://imgs.xkcd.com/comics/online_communities.png', 1024, 968),
		this.overlay('333', 'https://image.shutterstock.com/z/stock-vector-cool-milkshake-190524542.jpg', 1600, 1500)
	];

	overlay(id: string, imageUrl: string, imageWidth: number, imageHeight: number): IOverlay {
		const days = 10 * Math.random();
		const date = moment().subtract(days, 'day').toDate();
		const left = -117.94,
			top = 33.82,
			width = 0.05,
			height = 0.02,
			right = left + width * Math.random(),
			bottom = top - height * Math.random();
		return {
			name: id,
			id: id,
			photoTime: date.toISOString(),
			date: date,
			azimuth: 0,
			isGeoRegistered: false,
			sourceType: OpenLayersStaticImageSourceProviderSourceType,
			tag: {
				imageData: {
					imageWidth: imageWidth,
					imageHeight: imageHeight
				}
			},
			footprint: {
				type: 'MultiPolygon',
				coordinates: [[[
					[left, top],
					[right, top],
					[right, bottom],
					[left, bottom],
					[left, top]
				]]]
			},
			baseImageUrl: '',
			imageUrl: imageUrl,
			thumbnailUrl: imageUrl,
			sensorName: 'mySensorName',
			sensorType: 'mySensorType',
			bestResolution: 1,
			cloudCoverage: 1
		}
	}

	constructor(protected ansynApi: AnsynApi,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	ngOnInit() {
	}

	setPositionByRadius() {
		let center: Point = {
			type: 'Point',
			coordinates: [-117.914, 33.811]
		};
		this.ansynApi.setMapPositionByRadius(center, 100, true);
	}

	setPositionByRect() {
		let rect: Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[-118.02, 33.69],
					[-118.09, 33.69],
					[-118.09, 33.72],
					[-118.02, 33.72],
					[-118.02, 33.69]
				]
			]
		};
		this.ansynApi.setMapPositionByRect(rect);
	}

	setOverlayCriteria() {
		let criteria: IOverlaysCriteria = {
			region: {
				type: 'Point',
				coordinates: [-118.29, 33.60]
			}
		};
		this.ansynApi.setOverlaysCriteria(criteria);
	}

	displayOverlay() {
		this.ansynApi.displayOverLay(this.overlays[0]);
	}

	displayOverlaysOnTwoMaps() {
		this.ansynApi.changeMapLayout('layout2').pipe(
			tap(() => {
				this.ansynApi.setOverlays(this.overlays);
				this.ansynApi.displayOverLay(this.overlays[1], 0);
				this.ansynApi.displayOverLay(this.overlays[2], 1);
			}),
			take(1)
		).subscribe();
	}

	setOverlays() {
		this.ansynApi.setOverlays(this.overlays);
	}

	setLayout2maps() {
		this.ansynApi.changeMapLayout('layout2');
	}

	loadImageToCesium() {
		// Generate a CustomProjection as the "main layer projection."
		// This is also the projection for the tiled image.
		// Tiled Map Service imagery that uses the raster profile and doesn't have a SRS field in the tilemapresource.xml
		// requires a MapProjection.
		const approximateTransformArray = [
			1.10860130142421E-05, -5.12347147461916E-09, 0, -1.45037852704493E-16,
			4.2736022638275E-08, -8.94073933705065E-06, 0, 7.85158061091564E-17,
			0, 0, 1, 0,
			35.1560846628878, 32.9094158576589, 0, 1];

		// Flip image y coordinates
		approximateTransformArray[5] = -approximateTransformArray[5];

		const approximateTransform = Cesium.Matrix4.fromColumnMajorArray(approximateTransformArray);
		const approximateTransformInverse = Cesium.Matrix4.inverse(approximateTransform, new Cesium.Matrix4());

		const projectionText =
			'function createProjectionFunctions(callback) {\n' +
			'     var DEGREES_PER_RADIAN = ' + Cesium.Math.DEGREES_PER_RADIAN + ';\n' +
			'     var RADIANS_PER_DEGREE = ' + Cesium.Math.RADIANS_PER_DEGREE + ';\n' +
			'     var toGeographic = ' + JSON.stringify(Cesium.Matrix4.pack(approximateTransform, [])) + ';\n' +
			'     var toLocal = ' + JSON.stringify(Cesium.Matrix4.pack(approximateTransformInverse, [])) + ';\n' +
			'     function matrixMultiply(matrix, x, y) {\n' +
			'          var xr = matrix[0] * x + matrix[4] * y + matrix[12];\n' +
			'          var yr = matrix[1] * x + matrix[5] * y + matrix[13];\n' +
			'          var wr = matrix[3] * x + matrix[7] * y + matrix[15];\n' +
			'          return [xr / wr, yr / wr];\n' +
			'     }\n' +
			'     function project(cartographic, result) {\n' +
			'          var longitudeDegrees = DEGREES_PER_RADIAN * cartographic.longitude;\n' +
			'          var latitudeDegrees = DEGREES_PER_RADIAN * cartographic.latitude;\n' +
			'          var arr = matrixMultiply(toLocal, longitudeDegrees, latitudeDegrees);\n' +
			'          result.x = arr[0];\n' +
			'          result.y = arr[1];\n' +
			'          result.z = cartographic.height;\n' +
			'     }\n' +
			'     function unproject(cartesian, result) {\n' +
			'          var arr = matrixMultiply(toGeographic, cartesian.x, cartesian.y);\n' +
			'          result.longitude = arr[0] * RADIANS_PER_DEGREE;\n' +
			'          result.latitude = arr[1] * RADIANS_PER_DEGREE;\n' +
			'          result.height = cartesian.z;\n' +
			'     }\n' +
			'     callback(project, unproject);\n' +
			' }\n';
		const projectionTextUrl = 'data:text/javascript;base64,' + window.btoa(projectionText);
		const mainLayerProjection = new Cesium.CustomProjection(projectionTextUrl, 'main layer projection');

		// Add Raster TMS
		// This is an image pyramid that depends on the provided mapProjection.
		const limaProvider = Cesium.createTileMapServiceImageryProvider({
			url : 'assets/SampleData/mosaic_2638d8d2-b2e3-45f2-966e-f75c565a5dad/',
			mapProjection : mainLayerProjection
		});
	// public terrainProvider: any = null,
	// 		public sceneMode: ISceneMode = ISceneMode.SCENE2D,
	// 		public removePrevLayers = false
		const cesiumLayer = new CesiumLayer(limaProvider, mainLayerProjection, null, ISceneMode.SCENE2D, false);

		const position = this.ansynApi.getMapPosition();
		this.imageryCommunicatorService.provide(this.ansynApi.activeMapId).resetView(cesiumLayer, position).subscribe();
	}

}
