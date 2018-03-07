import Raster from 'ol/source/raster';
import Source from 'ol/source/source';
import Projection from 'ol/proj/projection';

export class ProjectableRaster extends Raster {

	sources: Source[];

	constructor(options: any) {
		super(options);
		this.sources = options.sources;
	}

	getProjection(): Projection {
		if (this.sources.length === 1) {
			return this.sources[0].getProjection();
		} else {
			throw new Error('Can not obtain raster projection with multiple sources');
		}
	}
}
