import { EntitiesVisualizer } from '../entities-visualizer';
import olFeature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, Point as GeoPoint } from 'geojson';
import { IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { Actions } from '@ngrx/effects';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { Action, Store } from '@ngrx/store';
import * as turf from '@turf/turf';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { MapActionTypes, ShadowMouseProducer } from '@ansyn/map-facade/actions/map.actions';
import { IToolsState, toolsFlags, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Subscription } from 'rxjs/Subscription';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Actions, Store, ProjectionService]
})
export class MouseShadowVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;

	isActive$ = this.store$
		.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.distinctUntilChanged()
		.map((activeMapId: string): boolean => this.mapId === activeMapId);

	mouseShadowProducer$ = this.actions$
		.ofType<Action>(MapActionTypes.SHADOW_MOUSE_PRODUCER);

	shadowMouseFlag$ = this.store$.select(toolsStateSelector)
		.pluck<IToolsState, Map<any, any>>('flags')
		.distinctUntilChanged()
		.map((flags) => flags.get(toolsFlags.shadowMouse));

	onEnterMap$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_ENTER);

	onLeaveMap$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_LEAVE)
		.do(() => {
			this.clearEntities();
			this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
		});

	createShadowMouseProducer$ = Observable.combineLatest(this.isActive$, this.shadowMouseFlag$, this.onEnterMap$)
		.do(([isActive, shadowMouseFlag]) => {
			this.clearEntities();
			if (isActive && shadowMouseFlag) {
				this.iMap.mapObject.on('pointermove', this.onPointerMove, this);
			} else {
				this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
			}
		});


	drawPoint$ = Observable.combineLatest(this.mouseShadowProducer$, this.isActive$)
		.filter(([{ payload }, isActive]: [ShadowMouseProducer, boolean]) => payload.outsideSource || !isActive)
		.mergeMap(([{ payload }, isActive]: [ShadowMouseProducer, boolean]) => this.setEntities([{
			id: 'shadowMouse',
			featureJson: turf.point(payload.point.coordinates)
		}
		]));


	constructor(protected actions$: Actions, protected store$: Store<IAppState>, protected projectionService: ProjectionService) {
		super();

		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: '/assets/icons/tools/mouse-shadow.svg'
			}),
			zIndex: 200
		});
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		if (logicalEntities.length <= 0) {
			return Observable.of(true);
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

		return this.projectionService.projectCollectionApproximatelyToImage<olFeature>(featuresCollectionToAdd, this.iMap)
			.map((features: olFeature[]) => {
				features.forEach((feature: olFeature) => {
					const id: string = <string>feature.getId();
					const existingEntity = this.idToEntity.get(id);
					this.idToEntity.set(id, { ...existingEntity, feature: feature });
				});
				this.source.addFeatures(features);
				return true;
			});
	}

	onPointerMove({ coordinate }: any) {
		const point = <GeoPoint> turf.geometry('Point', coordinate);
		return this.projectionService.projectApproximately(point, this.iMap)
			.take(1)
			.do((projectedPoint) => {
				this.store$.dispatch(new ShadowMouseProducer({ point: projectedPoint }));
			})
			.subscribe();
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			<Subscription>this.createShadowMouseProducer$.subscribe(),
			this.onLeaveMap$.subscribe(),
			this.drawPoint$.subscribe()
		)
		;
	}

	onDispose() {
		this.iMap.mapObject.un('pointermove', this.onPointerMove, this);
	}

	featureStyle(feature: olFeature, resolution) {
		return this._iconSrc;
	}
}
