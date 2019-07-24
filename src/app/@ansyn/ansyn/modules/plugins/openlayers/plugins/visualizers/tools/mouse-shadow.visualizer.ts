import olFeature from 'ol/Feature';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { FeatureCollection, Point as GeoPoint } from 'geojson';
import { MapActionTypes, selectActiveMapId, ShadowMouseProducer } from '@ansyn/map-facade';
import { Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import * as turf from '@turf/turf';
import { ImageryVisualizer, IVisualizerEntity } from '@ansyn/imagery';
import { selectToolFlag, toolsFlags } from '../../../../../menu-items/tools/reducers/tools.reducer';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { IToolsConfig, toolsConfig } from '../../../../../menu-items/tools/models/tools-config';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Actions, Store, OpenLayersProjectionService, toolsConfig]
})
export class MouseShadowVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;

	isActive$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => this.mapId === activeMapId)
	);

	mouseShadowProducer$ = this.actions$
		.pipe(ofType<Action>(MapActionTypes.SHADOW_MOUSE_PRODUCER));

	shadowMouseFlag$ = this.store$.select(selectToolFlag(toolsFlags.shadowMouse));

	onEnterMap$ = this.actions$
		.pipe(ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_ENTER));

	forceSendShadowMousePosition$ = of(this.toolsConfigData && this.toolsConfigData.ShadowMouse.forceSendShadowMousePosition);
	@AutoSubscription
	onLeaveMap$ = this.actions$
		.pipe(
			ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_LEAVE),
			tap(() => {
				this.clearEntities();
				this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
			}));

	@AutoSubscription
	createShadowMouseProducer$ = combineLatest(this.isActive$, this.shadowMouseFlag$, this.forceSendShadowMousePosition$, this.onEnterMap$)
		.pipe(tap(([isActive, shadowMouseFlag, forceSendShadowMousePosition ]) => {
			this.clearEntities();
			if ((isActive && shadowMouseFlag) || forceSendShadowMousePosition) {
				this.iMap.mapObject.on('pointermove', this.onPointerMove, this);
			} else {
				this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
			}
		}));

	@AutoSubscription
	drawPoint$ = combineLatest(this.mouseShadowProducer$, this.isActive$).pipe(
		filter(([{ payload }, isActive]: [ShadowMouseProducer, boolean]) => payload.outsideSource || !isActive),
		mergeMap(([{ payload }, isActive]: [ShadowMouseProducer, boolean]) => this.setEntities([{
			id: 'shadowMouse',
			featureJson: turf.point(payload.point.coordinates)
		}
		]))
	);


	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
				@Inject(toolsConfig) public toolsConfigData: IToolsConfig) {
		super();

		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: 'assets/icons/tools/mouse-shadow.svg'
			}),
			zIndex: 200
		});
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		if (logicalEntities.length <= 0) {
			return of(true);
		}

		const logicalEntitiesCopy = [...logicalEntities];

		const featuresCollectionToAdd: FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: []
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity) => {
			this.removeEntity(entity.id);
			const clonedFeatureJson: any = { ...entity.featureJson, id: entity.id };
			featuresCollectionToAdd.features.push(clonedFeatureJson);
			this.idToEntity.set(entity.id, { originalEntity: entity, feature: null });
		});

		return this.projectionService.projectCollectionApproximatelyToImage<olFeature>(featuresCollectionToAdd, this.iMap.mapObject).pipe(
			map((features: olFeature[]) => {
				features.forEach((feature: olFeature) => {
					const id: string = <string>feature.getId();
					const existingEntity = this.idToEntity.get(id);
					this.idToEntity.set(id, { ...existingEntity, feature: feature });
				});
				this.source.addFeatures(features);
				return true;
			}));
	}

	onPointerMove = ({ coordinate }: any): Subscription => {
		const point = <GeoPoint>turf.geometry('Point', coordinate);
		return this.projectionService.projectApproximately(point, this.iMap.mapObject).pipe(
			take(1),
			tap((projectedPoint) => {
				this.store$.dispatch(new ShadowMouseProducer({ point: projectedPoint }));
			}))
			.subscribe();
	};

	onDispose() {
		this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
	}

	featureStyle(feature: olFeature, resolution) {
		return this._iconSrc;
	}
}
