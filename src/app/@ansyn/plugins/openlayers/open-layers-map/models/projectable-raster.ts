import Raster from 'ol/source/Raster';
import Source from 'ol/source/Source';
import Projection from 'ol/proj/Projection';
import { get } from 'lodash';

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

	setOperation(operation: any, opt_lib?: any): void {
		this.destroy();
		super.setOperation(operation, opt_lib);
	}

	destroy(): void {
		const worker = get(this, 'worker_');
		if (worker) {
			const workers = get(worker, '_workers') || [];
			workers.forEach((worker: Worker) => worker.terminate());
		}
	}
}
