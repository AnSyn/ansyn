import { Utils } from './utils';

import * as proj from 'ol/proj';
import * as Extent from 'ol/extent';
import Projection from 'ol/proj/Projection';
import { EPSG_4326, EPSG_3857 } from '@ansyn/imagery';

export class MpImageProjection extends Projection {

	private matrix: any;
	private inversMatrix: any;
	private _tileSizeAtLevel0: any;
	private _projectionKey: string;

	constructor(meta, transform, csmKey) {

		const numLevels = meta.LevelsCount; // the pyramid level of the image
		const tileSizeAtLevel0 = (512 * 1 << (numLevels)); // number of pixels in row in non pyramidal image
		// const tileSizeAtLevel0 = meta.Height;
		// calculate the extenet of the non pyramidal image (tileSizeAtLevel0 X tileSizeAtLevel0 pixels) pixel
		let boundingExtent = Extent.boundingExtent([[0, 0], [tileSizeAtLevel0, tileSizeAtLevel0]]);

		// projection defenitions options
		const options = {
			code: Utils.uuid(), // get uniq id for projection,
			extent: boundingExtent,
			units: 'pixels'
		};

		super(options);

		this._tileSizeAtLevel0 = tileSizeAtLevel0;
		this._projectionKey = csmKey;
		// this.addCoordinateTransforms(this);
		let transformStrSource = transform || meta.GeoTransform; // the transform is always to the world
		if (transformStrSource === 'Identity') {
			transformStrSource = '1,0,0,0,0,-1,0,0,0,0,1,0,0,1,0,1';
		}
		let geoTransformStrArray = transformStrSource.split(',');
		geoTransformStrArray.forEach((a) => {
			geoTransformStrArray[a] = parseFloat(geoTransformStrArray[a]); // parsign from string to float
		});
		const geoTransform = geoTransformStrArray;
		const that = this;
		that.matrix = Utils.m4CreateNumber();
		Utils.m4SetFromArray(that.matrix, geoTransform); // set values in matrix
		that.inversMatrix = Utils.m4CreateNumber();
		Utils.m4Invert(that.matrix, that.inversMatrix); // Invert matrix ans set to inversMatrix

		// add transform to open layers //source   //destination
		proj.addCoordinateTransforms(EPSG_4326, this,
			// forward  from the source projection to the destination projection
			function (coordinate) {
				const res = Utils.m4MultVec3Projective(that.inversMatrix, [coordinate[0], coordinate[1], 0], []);
				res[1] = tileSizeAtLevel0 - res[1];
				return res;
			},
			// inverse from the destination projection to the source projection
			function (coordinate) {
				let y = coordinate[1];
				y = tileSizeAtLevel0 - y;
				const res = Utils.m4MultVec3Projective(that.matrix, [coordinate[0], y, 0], []);
				return res;
			});

		proj.addCoordinateTransforms(EPSG_3857, this,
			// forward  from the source projection to the destination projection
			function (coordinate) {
				let coord4326 = proj.transform(coordinate, EPSG_3857, EPSG_4326);
				const res = Utils.m4MultVec3Projective(that.inversMatrix, [coord4326[0], coord4326[1], 0], []);
				res[1] = tileSizeAtLevel0 - res[1];
				return res;
			},
			// inverse from the destination projection to the source projection
			function (coordinate) {
				let y = coordinate[1];
				y = tileSizeAtLevel0 - y;
				const res = Utils.m4MultVec3Projective(that.matrix, [coordinate[0], y, 0], []);
				let coord3857 = proj.transform(res, EPSG_4326, EPSG_3857);
				return coord3857;
			});
	}

	// flip the y from buttom left to top left (how our server works)
	private OLPixelToImagePixel(coordinate) {
		let y = coordinate[1];
		y = this._tileSizeAtLevel0 - y;
		return [coordinate[0], y];
	}

	public get projectionKey(): string {
		return this._projectionKey;
	}

	public addCoordinateTransforms(source) {
		let that = this;
		proj.addCoordinateTransforms(source, this,
			// forward  from the source projection to the destination projection
			function (coordinate) {
				let coord = proj.transform(coordinate, source, EPSG_4326);
				const res = Utils.m4MultVec3Projective(that.inversMatrix, [coord[0], coord[1], 0], []);
				res[1] = that._tileSizeAtLevel0 - res[1];
				return res;
			},
			// inverse from the destination projection to the source projection
			function (coordinate) {
				let y = coordinate[1];
				y = that._tileSizeAtLevel0 - y;
				let res = Utils.m4MultVec3Projective(that.matrix, [coordinate[0], y, 0], []);
				res = proj.transform(res, EPSG_4326, source);
				return res;
			});
	}
}

