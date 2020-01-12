import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { FeatureCollection, GeometryObject } from 'geojson';
import { selectActiveMapId } from '@ansyn/map-facade';
import {
	getPointByGeometry,
	getPolygonByPointAndRadius,
	ImageryVisualizer,
	VisualizerInteractions
} from '@ansyn/imagery';
import Draw from 'ol/interaction/Draw';
import { AutoSubscription } from 'auto-subscriptions';
import { distinctUntilChanged, map, mergeMap, take, tap } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import {
	selectAlgorithmTaskDrawIndicator,
	selectCurrentAlgorithmTaskAlgorithmName,
	selectCurrentAlgorithmTaskRegion
} from '../../../../../menu-items/algorithms/reducers/tasks.reducer';
import { SetCurrentTaskRegion, SetTaskDrawIndicator } from '../../../../../menu-items/algorithms/actions/tasks.actions';
import { TasksService } from '../../../../../menu-items/algorithms/services/tasks.service';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService, TasksService]
})
export class TaskRegionVisualizer extends EntitiesVisualizer {
	iconStyle: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	rectStyle: Style = new Style({
		stroke: new Stroke({
			color: 'rgba(255,255,255,1)',
			width: 3
		})
	});


	region$ = this.store$.select(selectCurrentAlgorithmTaskRegion);

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	drawIndicator$ = this.store$.select(selectAlgorithmTaskDrawIndicator);

	regionLengthInMeter: number;
	DEFAULT_REGION_LENGTH_IN_METERS = 1000;

	@AutoSubscription
	regionLengthInMeter$ = this.store$.select(selectCurrentAlgorithmTaskAlgorithmName).pipe(
		tap((algName: string) => {
			let length = this.DEFAULT_REGION_LENGTH_IN_METERS;
			if (algName) {
				length = this.tasksService.config.algorithms[algName].regionLengthInMeters;
			}
			this.regionLengthInMeter = length;
		})
	);

	@AutoSubscription
	interactionChanges$: Observable<any> = combineLatest(this.isActiveMap$, this.drawIndicator$).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = combineLatest(this.region$, this.drawIndicator$, this.regionLengthInMeter$).pipe(
		mergeMap(this.drawChanges.bind(this)));

	constructor(
		public store$: Store<any>,
		public actions$: Actions,
		public projectionService: OpenLayersProjectionService,
		public tasksService: TasksService
	) {
		super();
	}

	drawChanges([region]) {
		if (!region) {
			this.clearEntities();
			return EMPTY;
		}
		return this.drawRegionOnMap(region);
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(SetTaskDrawIndicator({payload: false}));

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject).pipe(
			take(1),
			tap((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				const region = this.createRegion(geoJsonFeature);
				this.store$.dispatch(SetCurrentTaskRegion(region));
			})
		).subscribe();
	}

	createDrawInteraction() {
		const drawInteractionHandler = new Draw({
			type: 'Point',
			condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
			style: this.iconStyle
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	public removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	resetInteractions() {
		super.resetInteractions();
		this.store$.dispatch(SetTaskDrawIndicator({payload: false}));
	}

	interactionChanges([isActiveMap, drawIndicator]: [boolean, boolean]): void {
		this.removeDrawInteraction();
		if (isActiveMap && drawIndicator) {
			this.createDrawInteraction();
		}
	}

	onDispose() {
		this.removeDrawInteraction();
		super.onDispose();
	}

	featureStyle(feature: Feature, state) {
		return this.rectStyle;
	}

	drawRegionOnMap(point: GeometryObject): Observable<boolean> {
		const coordinates = getPointByGeometry(point).coordinates;
		const featureJson = getPolygonByPointAndRadius(coordinates, this.regionLengthInMeter / 2000);
		const id = 'algorithmTaskRegion';
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion(geoJsonFeature: any): any {
		return geoJsonFeature.geometry;
	}
}
