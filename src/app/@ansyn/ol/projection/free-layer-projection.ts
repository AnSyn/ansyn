import TileLayer from 'ol/layer/Tile';
import { add, get as getProjection } from 'ol/proj/projections';
import { remove as removeTransformFunc, get as getTransform } from 'ol/proj/transforms';

TileLayer.prototype.disposeLayer = (layer) => {
	function removeTransform(fromProjectionCode, toProjection) {
		const toProjectionCode = toProjection.getCode();
		const fromProjection = getProjection(fromProjectionCode);
		let isExistTransform = getTransform(fromProjectionCode, toProjectionCode);
		if (isExistTransform) {
			removeTransformFunc(fromProjection, toProjection);
		}
		isExistTransform = getTransform(toProjectionCode, fromProjectionCode);
		if (isExistTransform) {
			removeTransformFunc(toProjection, fromProjection);
		}
	}

	const source = layer.getSource();
	if (Boolean(source)) {
		let projection = source.projection || source.getProjection();
		const code = projection && projection.getCode();
		if (!projection || !Boolean(code) || code === 'EPSG:4326' || code === 'EPSG:3857') {
			return;
		}

		removeTransform('EPSG:4326', projection);
		removeTransform('EPSG:2857', projection);
		removeTransform(code, projection);

		if (projection.tag) {
			projection.tag.dispose();
			delete (projection.tag);
			projection.tag = undefined;
		}

		if (projection && projection.dispose) {
			projection.dispose();
			}
		projection = undefined;
		add(code, undefined);
	}
};
