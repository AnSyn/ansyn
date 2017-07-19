import * as ol from 'openlayers';

export class ProjectableRaster extends ol.source.Raster {

    sources: ol.source.Source[];

    constructor(options: olx.source.RasterOptions) {
        super(options);
        this.sources = options.sources;
    }

    getProjection(): ol.proj.Projection {
        if (this.sources.length === 1) {
            return this.sources[0].getProjection();
        } else {
            throw new Error('Can not obtain raster projection with multiple sources');
        }
    }
}
