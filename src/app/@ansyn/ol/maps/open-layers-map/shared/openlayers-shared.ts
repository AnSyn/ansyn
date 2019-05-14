import Layer from 'ol/layer/Layer';
import { ProjectableRaster } from '../models/projectable-raster';

export function isRasterLayer(layer): boolean {
	return layer instanceof Layer && layer.getSource() instanceof ProjectableRaster;
}

export function removeWorkers(layer) {
	if (isRasterLayer(layer)) {
		layer.getSource().destroy();
	}

}
