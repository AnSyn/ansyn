import { BaseMapSourceProvider, CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState, IMapSourceProvidersConfig, IOverlay, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';

import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-provider/tb.model';
import {
	createTransform,
	createTransformForCesium,
	createTransformMatrix,
	FROMCOORDINATES,
	FROMPIXEL
} from './transforms';


import { noop } from 'rxjs';
import { CesiumMap } from "@ansyn/plugins";
import { CesiumLayer, ISceneMode } from "@ansyn/plugins";
import { calculateApproximateTransform } from "./cesium-transform";

export const CesiumTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: CesiumTBSourceProviderSourceType,
	supported: [CesiumMap],
	forOverlay: true
})
export class CesiumTBSourceProvider extends BaseMapSourceProvider<ITBConfig> {
	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig
	) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	public create(metaData: ICaseMapState): any {
		let layer;
		if (metaData.data.overlay.tag.fileType === 'image') {
			// const extent: any = [0, 0, metaData.data.overlay.tag.imageData.ExifImageWidth, metaData.data.overlay.tag.imageData.ExifImageHeight];
			const projection = this.createProjection(metaData.data.overlay);

			// const overlay = metaData.data.overlay;
			// const extent: any = [0, 0, overlay.tag.imageData.ExifImageWidth, overlay.tag.imageData.ExifImageHeight];
			// const boundary = overlay.tag.geoData.footprint.geometry.coordinates[0];
			// const code = `tb-image ${overlay.id}`;
			// const transformer = createTransformMatrix(boundary, extent[2], extent[3]);

			// Add Raster TMS
			// This is an image pyramid that depends on the provided mapProjection.
			// const limaProvider = Cesium.SingleTileImageryProvider({
			// 	url : metaData.data.overlay.imageUrl,
			// 	rectangle : Cesium.Rectangle.fromDegrees(o),
			// 	mapProjection : projection
			// })


			const comm = this.imageryCommunicatorService.provide(metaData.id);
			// const pixelPerfectReprojection = new Cesium.ImageryMosaic({
			// 	urls : [metaData.data.overlay.imageUrl],
			// 	projections : [projection],
			// 	scene : comm.ActiveMap.mapObject.scene,
			// 	concurrency : 1,
			// 	flipY : true
			// }, comm.ActiveMap.mapObject);
			// const limaProvider = Cesium.createTileMapServiceImageryProvider({
			// 	url : metaData.data.overlay.imageUrl,
			// 	mapProjection : projection
			// });
			// public terrainProvider: any = null,
			// 		public sceneMode: ISceneMode = ISceneMode.SCENE2D,
			// 		public removePrevLayers = false
			// layer = new CesiumLayer(limaProvider, projection, null, ISceneMode.SCENE2D, false);
		}
		else
		{
			console.error('NOT IMPLEMENTED');
		}
		return [layer];
	}


	createAsync(metaData: ICaseMapState): Promise<any> {
		const layers = this.create(metaData);
		return Promise.resolve(layers[0]); // this.addFootprintToLayerPromise(Promise.resolve(layers[0]), metaData);
	}


	getThumbnailName(overlay: IOverlay): string {
		return overlay.name;
	}

	private createProjection(overlay) {
		const extent: any = [0, 0, overlay.tag.imageData.ExifImageWidth, overlay.tag.imageData.ExifImageHeight];
		const boundary = overlay.tag.geoData.footprint.geometry.coordinates[0];
		const code = `tb-image ${overlay.id}`;

		// Generate a CustomProjection as the "main layer projection."
		// This is also the projection for the tiled image.
		// Tiled Map Service imagery that uses the raster profile and doesn't have a SRS field in the tilemapresource.xml
		// requires a MapProjection.
		const approximateTransformArray = calculateApproximateTransform(boundary, extent[2], extent[3]);

		// Flip image y coordinates
		approximateTransformArray[5] = -approximateTransformArray[5];

		const approximateTransform = Cesium.Matrix3.fromColumnMajorArray(approximateTransformArray);
		const approximateTransformInverse = Cesium.Matrix3.inverse(approximateTransform, new Cesium.Matrix3());

		const projectionText =
			'function createProjectionFunctions(callback) {\n' +
			'     var DEGREES_PER_RADIAN = ' + Cesium.Math.DEGREES_PER_RADIAN + ';\n' +
			'     var RADIANS_PER_DEGREE = ' + Cesium.Math.RADIANS_PER_DEGREE + ';\n' +
			'     var toGeographic = ' + JSON.stringify(Cesium.Matrix3.pack(approximateTransform, [])) + ';\n' +
			'     var toLocal = ' + JSON.stringify(Cesium.Matrix3.pack(approximateTransformInverse, [])) + ';\n' +
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
		const mainLayerProjection = new Cesium.CustomProjection(projectionTextUrl, code);

		return mainLayerProjection;
	}

	// private createDroneTiffProjection(overlay) {
	// 	if (overlay.sensorType !== 'Awesome Drone Imagery (GeoTIFF)') {
	// 		return overlay.tag.geoserver.data.srs
	// 	}
	// 	const extent: any = [0, 0, overlay.tag.imageData.ExifImageWidth, overlay.tag.imageData.ExifImageHeight];
	// 	const boundary = overlay.tag.geoData.footprint.geometry.coordinates[0];
	// 	const transformer = createTransform(boundary, extent[2], extent[3]);
	//
	// 	const projection = new Projection({
	// 		code: `EPSG:32662`,
	// 		units: 'm',
	// 		axisOrientation: 'neu',
	// 		global: false
	// 	});
	//
	// 	proj.addProjection(projection);
	//
	// 	proj.addCoordinateTransforms(projection, 'EPSG:3857',
	// 		coords => {
	// 			return transformer.EPSG3857(FROMPIXEL, ...coords);
	//
	// 		},
	// 		coords => {
	// 			return transformer.EPSG3857(FROMCOORDINATES, ...coords);
	// 		}
	// 	);
	//
	// 	proj.addCoordinateTransforms(projection, 'EPSG:4326', function ([x, y]) {
	// 			return transformer.EPSG4326(FROMPIXEL, x, y + overlay.tag.imageData.ExifImageHeight);
	// 		},
	// 		([lng, lat]) => {
	// 			const [x, y] = transformer.EPSG4326(FROMCOORDINATES, lng, lat);
	// 			return [x, y - overlay.tag.imageData.ExifImageHeight];
	// 		}
	// 	);
	//
	// 	return projection;
	// }


}
