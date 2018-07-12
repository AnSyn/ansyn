import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import Point from 'ol/geom/point';
import Polygon from 'ol/geom/polygon';
import { getPointByGeometry } from '@ansyn/core/utils/geo';
import { getTimeDiff, getTimeDiffFormat } from '@ansyn/core/utils/time';
import { CaseMapState, IContextEntity } from '@ansyn/core/models/case.model';
import GeoJSON from 'ol/format/geojson';
import { Observable } from 'rxjs';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { select, Store } from '@ngrx/store';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { selectContextEntities } from '@ansyn/context/reducers/context.reducer';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';
import { ImageryVisualizer } from '@ansyn/imagery/model/decorators/imagery-visualizer';
import { BackToWorldView, CoreActionTypes } from '@ansyn/core/actions/core.actions';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { distinctUntilChanged, filter, map, tap, withLatestFrom } from 'rxjs/internal/operators';
import { ImageryPluginSubscription } from '@ansyn/imagery/model/base-imagery-plugin';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Actions, Store, ImageryCommunicatorService]
})
export class ContextEntityVisualizer extends EntitiesVisualizer {
	referenceDate: Date;
	idToCachedCenter: Map<string, Polygon | Point> = new Map<string, Polygon | Point>();
	geoJsonFormat: GeoJSON;

	@ImageryPluginSubscription
	contextEntites$ = this.store$.select(selectContextEntities)
		.filter(Boolean)
		.mergeMap(this.setEntities.bind(this));

	@ImageryPluginSubscription
	referenceDate$ = this.store$
		.pipe(
			select(mapStateSelector),
			map(({ mapsList }: IMapState) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: CaseMapState) => map.data.overlay && map.data.overlay.date),
			distinctUntilChanged(),
			tap((referenceDate) => this.referenceDate = referenceDate)
		);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>) {
		super();

		this.updateStyle({
			initial: {
				stroke: {
					color: '#3DCC33'
				},
				icon: {
					scale: 1,
					src: 'assets/icons/map/entity-marker.svg',
					anchor: [0.5, 1]
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
		if (!this.referenceDate || !(this.getGeometry(feature) instanceof Point)) {
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

		if (<any>entityMap.originalEntity.featureJson.geometry.type === 'Point') {
			const featureGeoJson = <any> this.geoJsonFormat.writeFeatureObject(entityMap.feature);
			const centroid = getPointByGeometry(featureGeoJson.geometry);
			const point = new Point(<[number, number]> centroid.coordinates);

			this.idToCachedCenter.set(featureId, point);
			return point;
		} else if (<any>entityMap.originalEntity.featureJson.geometry.type === 'Polygon') {
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

}
