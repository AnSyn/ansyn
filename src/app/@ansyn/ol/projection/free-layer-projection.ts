import TileLayer from 'ol/layer/Tile';
import { add, get } from 'ol/proj/projections';
import { remove as removeTransformFunc } from 'ol/proj/transforms';

TileLayer.prototype.disposeLayer = (layer) => {
	const source = layer.getSource();
	if (Boolean(source)) {
		let projection = source.projection || source.getProjection();
		const code = projection && projection.getCode();
		if (!projection || !Boolean(code) || code === 'EPSG:4236' || code === 'EPSG:3857') {
			return;
		}

		const like4326 = get('EPSG:4326');
		removeTransformFunc(like4326, projection);
		let isExistTransform = get(projection, like4326);
		if (isExistTransform) {
			removeTransformFunc(projection, like4326);
		}

		const like3857 = get('EPSG:3857');
		removeTransformFunc(like3857, projection);
		isExistTransform = get(projection, like3857);
		if (isExistTransform) {
			removeTransformFunc(projection, like3857);
		}
		isExistTransform = get(projection, projection);
		if (isExistTransform) {
			removeTransformFunc(projection, projection);
		}
		if (projection.tag) {
			projection.tag.dispose();
			delete(projection.tag);
			projection.tag = undefined;
			projection = undefined;
		}

		if (projection.dispose) {
			projection.dispose();
			projection = undefined;
		}
		add(code, undefined);

	}
};
