import { EntitiesVisualizer } from '@ansyn/open-layer-visualizers/entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';

import proj from 'ol/proj';
import Point from 'ol/geom/point';

import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { IVisualizerEntity } from '@ansyn/imagery';

export const ContextEntityVisualizerType = 'ContextEntityVisualizer';

export class ContextEntityVisualizer extends EntitiesVisualizer {

	private iconStyle: Style;
	_idToCachedCenter: Map<string, Point>;

	constructor(args: any) {
		super(ContextEntityVisualizerType, args);

		this.iconStyle = new Icon({
			scale: 1,
			src: '/assets/icons/map/entity-marker.svg'
		});
		this._idToCachedCenter = new Map<string, Point>();
	}

	featureStyle(feature: Feature, resolution) {
		const superStyle = super.featureStyle(feature, resolution);
		const featureId = `${feature.getId()}_context`;
		let style = this._styleCache[featureId];
		if (!style) {
			style = [
				superStyle,
				new Style({
					image: this.iconStyle,
					geometry: this.getGeometry.bind(this)
				})
			];
			this._styleCache[featureId] = style;
		}
		return style;
	}

	getGeometry(originalFeature) {
		const featureId = originalFeature.getId();
		if (this._idToCachedCenter.has(featureId)) {
			return this._idToCachedCenter.get(featureId);
		}

		const entityMap = this._idToEntity.get(featureId);
		const lonLat = getPointByPolygon(entityMap.originalEntity.featureJson.geometry);
		const view = this._imap.mapObject.getView();
		const projection = view.getProjection();
		const lonLatCords = proj.fromLonLat(lonLat.coordinates, projection);
		const point = new Point(lonLatCords);
		this._idToCachedCenter.set(featureId, point);
		return point;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		logicalEntities.forEach((entity)=>{
			if (this._idToCachedCenter.has(entity.id)){
				this._idToCachedCenter.delete(entity.id);
			}
		});
		super.addOrUpdateEntities(logicalEntities);
	}
}
