import { EntitiesVisualizer } from '@ansyn/open-layer-visualizers/entities-visualizer';

import proj from 'ol/proj';
import Point from 'ol/geom/point';
import Polygon from 'ol/geom/polygon';
import { getPointByPolygon } from '@ansyn/core/utils/geo';
import { getTimeDiff, getTimeDiffFormat } from '@ansyn/core/utils/time';
import { IVisualizerEntity } from '@ansyn/imagery';
import { IContextEntity } from '@ansyn/core/models/case.model';
import { VisualizerStateStyle } from '@ansyn/open-layer-visualizers/models/visualizer-state';

export const ContextEntityVisualizerType = 'ContextEntityVisualizer';

export class ContextEntityVisualizer extends EntitiesVisualizer {
	static type = ContextEntityVisualizerType;

	isHideable = true;

	referenceDate: Date;
	idToCachedCenter: Map<string, Point> = new Map<string, Point>();

	constructor(style: VisualizerStateStyle) {
		super(ContextEntityVisualizerType, style);

		this.updateStyle({
			initial: {
				stroke: {
					color: '#3DCC33'
				},
				icon: {
					scale: 1,
					src: '/assets/icons/map/entity-marker.svg'
				},
				geometry: this.getGeometry.bind(this),
				label: {
					font: '12px Calibri,sans-serif',
					fill: {
						color: '#fff'
					},
					stroke: {
						color: '#000',
						width: 3
					},
					offsetY: 30,
					text: this.getText.bind(this)
				}
			}
		});
	}

	private getText(feature) {
		if (!this.referenceDate) {
			return '';
		}
		const originalEntity = this.idToEntity.get(feature.getId()).originalEntity;
		const entityDate = (<IContextEntity>originalEntity).date;
		const timeDiff = getTimeDiff(this.referenceDate, entityDate);

		console.log(getTimeDiffFormat(timeDiff));

		return getTimeDiffFormat(timeDiff);
	}

	private getGeometry(originalFeature) {
		const featureId = originalFeature.getId();
		if (this.idToCachedCenter.has(featureId)) {
			return this.idToCachedCenter.get(featureId);
		}

		const entityMap = this.idToEntity.get(featureId);
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();

		if (<any>entityMap.originalEntity.featureJson.type === 'Point') {
			const lonLat = getPointByPolygon(entityMap.originalEntity.featureJson.geometry);
			const lonLatCords = proj.fromLonLat(lonLat.coordinates, projection);
			const point = new Point(lonLatCords);

			this.idToCachedCenter.set(featureId, point);
			return point;
		} else if (<any>entityMap.originalEntity.featureJson.type === 'Polygon') {
			const polygon = entityMap.originalEntity.featureJson.geometry as Polygon;
			const lonLatCords = proj.fromLonLat(polygon.coordinates, projection);
			const projectedPolygon = new Polygon(lonLatCords);

			this.idToCachedCenter.set(featureId, projectedPolygon);
			return projectedPolygon;
		}
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]) {
		logicalEntities.forEach((entity) => {
			if (this.idToCachedCenter.
				has(entity.id)) {
				this.idToCachedCenter.delete(entity.id);
			}
		});
		super.addOrUpdateEntities(logicalEntities);
	}

	setReferenceDate(date: Date) {
		this.referenceDate = date;
	}
}
