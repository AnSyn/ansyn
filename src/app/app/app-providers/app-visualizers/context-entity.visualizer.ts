import { EntitiesVisualizer } from '@ansyn/open-layer-visualizers/entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';

import proj from 'ol/proj';
import Point from 'ol/geom/point';

import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { getTimeDiff, getTimeDiffFormat } from '@ansyn/core/utils/time';
import { IVisualizerEntity } from '@ansyn/imagery';
import { IContextEntity } from '@ansyn/core/models/case.model';
import { VisualizerStateStyle } from '../packages/open-layer-visualizers/models/visualizer-state';

export const ContextEntityVisualizerType = 'ContextEntityVisualizer';

export class ContextEntityVisualizer extends EntitiesVisualizer {
	iconStyle: Style;
	referenceDate: Date;
	idToCachedCenter: Map<string, Point>;

	constructor(style: VisualizerStateStyle) {
		super(ContextEntityVisualizerType, style, {
			initial: {
				stroke: {
					color: '#3DCC33'
				}
			}
		});

		this.iconStyle = new Icon({
			scale: 1,
			src: '/assets/icons/map/entity-marker.svg'
		});
		this.idToCachedCenter = new Map<string, Point>();
	}

	featureStyle(feature: Feature, resolution) {
		const featureId = `${feature.getId()}_context`;
		let style = this.styleCache[featureId];
		if (!style) {
			const superStyle = super.featureStyle(feature, resolution);
			const textStyle = new Text({
				font: '12px Calibri,sans-serif',
				fill: new Fill({
					color: '#fff'
				}),
				stroke: new Stroke({
					color: '#000',
					width: 3
				}),
				offsetY: 30
			});

			style = [
				superStyle,
				new Style({
					image: this.iconStyle,
					geometry: this.getGeometry.bind(this),
					text: textStyle
				})
			];
			if (!this.referenceDate) {
				textStyle.setText('');
			} else {
				const originalEntity = this.idToEntity.get(feature.getId()).originalEntity;
				const entityDate = (<IContextEntity>originalEntity).date;
				const timeDiff = getTimeDiff(this.referenceDate, entityDate);
				const timeFormat = getTimeDiffFormat(timeDiff);
				textStyle.setText(timeFormat);
			}
			this.styleCache[featureId] = style;
		}
		return style;
	}

	getGeometry(originalFeature) {
		const featureId = originalFeature.getId();
		if (this.idToCachedCenter.has(featureId)) {
			return this.idToCachedCenter.get(featureId);
		}

		const entityMap = this.idToEntity.get(featureId);
		const lonLat = getPointByPolygon(entityMap.originalEntity.featureJson.geometry);
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();
		const lonLatCords = proj.fromLonLat(lonLat.coordinates, projection);
		const point = new Point(lonLatCords);
		this.idToCachedCenter.set(featureId, point);
		return point;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		logicalEntities.forEach((entity) => {
			if (this.idToCachedCenter.has(entity.id)) {
				this.idToCachedCenter.delete(entity.id);
			}
		});
		super.addOrUpdateEntities(logicalEntities);
	}

	setReferenceDate(date: Date) {
		this.referenceDate = date;
		this.styleCache = {};
	}
}
