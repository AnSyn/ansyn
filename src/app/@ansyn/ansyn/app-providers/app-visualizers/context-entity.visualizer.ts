import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import Point from 'ol/geom/point';
import Polygon from 'ol/geom/polygon';
import { getPointByGeometry } from '@ansyn/core/utils/geo';
import { getTimeDiff, getTimeDiffFormat } from '@ansyn/core/utils/time';
import { IContextEntity } from '@ansyn/core/models/case.model';
import GeoJSON from 'ol/format/geojson';
import { Observable } from 'rxjs/Observable';
import { ImageryVisualizer, IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: []
})
export class ContextEntityVisualizer extends EntitiesVisualizer {
	referenceDate: Date;
	idToCachedCenter: Map<string, Polygon | Point> = new Map<string, Polygon | Point>();
	geoJsonFormat: GeoJSON;

	constructor() {
		super();

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

		this.geoJsonFormat = new GeoJSON();
	}

	private getText(feature) {
		if (!this.referenceDate) {
			return '';
		}
		const originalEntity = this.idToEntity.get(feature.getId()).originalEntity;
		const entityDate = (<IContextEntity>originalEntity).date;
		const timeDiff = getTimeDiff(this.referenceDate, entityDate);

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
			const featureGeoJson = <any> this.geoJsonFormat.writeFeatureObject(entityMap.feature);
			const centroid = getPointByGeometry(featureGeoJson.geometry);
			const point = new Point(<[number, number]> centroid.coordinates);

			this.idToCachedCenter.set(featureId, point);
			return point;
		} else if (<any>entityMap.originalEntity.featureJson.type === 'Polygon') {
			const projectedPolygon = entityMap.feature.getGeometry() as Polygon;

			this.idToCachedCenter.set(featureId, projectedPolygon);
			return projectedPolygon;
		}
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		logicalEntities.forEach((entity) => {
			if (this.idToCachedCenter.has(entity.id)) {
				this.idToCachedCenter.delete(entity.id);
			}
		});
		return super.addOrUpdateEntities(logicalEntities);
	}

	setReferenceDate(date: Date) {
		this.referenceDate = date;
	}
}
