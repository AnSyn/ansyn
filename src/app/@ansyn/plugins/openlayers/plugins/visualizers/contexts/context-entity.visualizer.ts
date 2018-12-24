import olPoint from 'ol/geom/point';
import olPolygon from 'ol/geom/polygon';
import {
	getPointByGeometry,
	getTimeDiff,
	getTimeDiffFormat,
	ICaseMapState,
	IContextEntity,
	IVisualizerEntity
} from '@ansyn/core';
import GeoJSON from 'ol/format/geojson';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { ImageryCommunicatorService, ImageryVisualizer } from '@ansyn/imagery';
import { select, Store } from '@ngrx/store';
import { selectContextEntities } from '@ansyn/context';
import { IMapState, MapFacadeService, mapStateSelector } from '@ansyn/map-facade';
import { distinctUntilChanged, filter, map, mergeMap, tap } from 'rxjs/internal/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer } from '../entities-visualizer';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Actions, Store, ImageryCommunicatorService]
})
export class ContextEntityVisualizer extends EntitiesVisualizer {
	referenceDate: Date;
	idToCachedCenter: Map<string, olPolygon | olPoint> = new Map<string, olPolygon | olPoint>();
	geoJsonFormat: GeoJSON;

	@AutoSubscription
	contextEntites$ = this.store$.select(selectContextEntities).pipe(
		filter(Boolean),
		mergeMap(this.setEntities.bind(this))
	);

	@AutoSubscription
	referenceDate$ = this.store$
		.pipe(
			select(mapStateSelector),
			map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: ICaseMapState) => map.data.overlay && map.data.overlay.date),
			distinctUntilChanged(),
			tap((referenceDate) => {
				this.referenceDate = referenceDate;
				this.purgeCache();
				this.source.refresh();
			})
		);

	constructor(protected actions$: Actions,
				protected store$: Store<any>) {
		super();

		this.updateStyle({
			initial: {
				stroke: '#3DCC33',
				fill: '#3DCC33',
				'fill-opacity': 0,
				icon: {
					scale: 1,
					src: 'assets/icons/map/entity-marker.svg',
					anchor: [0.5, 1]
				},
				geometry: this.getGeometry.bind(this),
				label: {
					font: '12px Calibri,sans-serif',
					fill: '#fff',
					stroke: '#000',
					'stroke-width': 3,
					offsetY: 30,
					text: this.getText.bind(this)
				}
			}
		});

		this.geoJsonFormat = new GeoJSON();
	}

	private getText(feature) {
		if (!this.referenceDate || !(this.getGeometry(feature) instanceof olPoint)) {
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

		if (<any>entityMap.originalEntity.featureJson.geometry.type === 'Point') {
			const featureGeoJson = <any> this.geoJsonFormat.writeFeatureObject(entityMap.feature);
			const centroid = getPointByGeometry(featureGeoJson.geometry);
			const point = new olPoint(<[number, number]> centroid.coordinates);

			this.idToCachedCenter.set(featureId, point);
			return point;
		} else if (<any>entityMap.originalEntity.featureJson.geometry.type === 'Polygon') {
			const projectedPolygon = entityMap.feature.getGeometry() as olPolygon;

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

}
