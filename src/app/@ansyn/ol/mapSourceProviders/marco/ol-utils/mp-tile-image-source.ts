import * as proj from 'ol/proj';
import * as Extent from 'ol/extent';
import TileImage from 'ol/source/TileImage';
import Projection from 'ol/proj/Projection';
import TileGrid from 'ol/tilegrid/TileGrid';

import { MpImageProjection } from './mp-image-projection';
import { ProjectableRaster } from '../../../maps/open-layers-map/models/projectable-raster';

const urlTemplate = '&tileMatrix={z}&tileCol={x}&tileRow={y}';

export class MpTileImageSource extends ProjectableRaster {

	public _url: any;
	public crossOrigin: any;
	public _meta: any;
	public _projection: any;

	static createForExtent(extent, opt_maxZoom) {
		const tileSize = 512;

		const resolutions = MpTileImageSource.resolutionsFromExtent(
			extent, opt_maxZoom, tileSize);

		const widths = new Array(resolutions.length);
		const extentWidth = Extent.getWidth(extent);
		for (let z = resolutions.length - 1; z >= 0; --z) {
			widths[z] = extentWidth / (2 * tileSize) / resolutions[z];
		}

		return new TileGrid({
			origin: Extent.getTopLeft(extent),
			resolutions: resolutions,
			tileSize: tileSize,
			extent: extent
		});
	}

	// ol.DEFAULT_MAX_ZOOM = 42; //by src/ol/index
	// ol.DEFAULT_TILE_SIZE = 256; //by src/ol/index
	static resolutionsFromExtent(extent, opt_maxZoom, opt_tileSize) {
		const maxZoom = opt_maxZoom !== undefined ? opt_maxZoom : 42;

		const height = Extent.getHeight(extent);
		const width = Extent.getWidth(extent);

		const tileSize = opt_tileSize !== undefined ? opt_tileSize : 512;
		const maxResolution = Math.max(
			width / (2 * tileSize), height / (2 * tileSize));

		const length = maxZoom + 1;
		const resolutions = new Array(length);
		for (let z = 0; z < length; ++z) {
			resolutions[z] = maxResolution / Math.pow(2, z);
		}
		return resolutions;
	}

	static create(data, url, transform, csmKey) {
		return new MpTileImageSource(data, url, transform, csmKey);
	}

	constructor(meta, url, transform, csmKey) {
		const projection = <Projection>new MpImageProjection(meta, transform, csmKey);
		proj.addProjection(projection);

		const tileGrid = MpTileImageSource.createForExtent(projection.getExtent(), meta.LevelsCount - 1);

		const innerTileImageSource: TileImage = new TileImage({
			tileUrlFunction: function (tileCoord, pixelRatio, proj) {
				const z = tileCoord[0];
				const x = tileCoord[1];
				const y = -tileCoord[2] - 1;
				return url + urlTemplate.replace('{z}', z.toString())
					.replace('{y}', y.toString())
					.replace('{x}', x.toString());

			},
			tileGrid: tileGrid,
			url: url,
			crossOrigin: 'Anonymous',
			projection: projection
		});
		super({
			sources: [innerTileImageSource],
			operation: function (pixels, data) {
				return pixels[0];
			},
			operationType: 'image'
		});

		this._url = url;
		this.crossOrigin = 'Anonymous';
		this._meta = meta;
		this._projection = projection;
	}
}
