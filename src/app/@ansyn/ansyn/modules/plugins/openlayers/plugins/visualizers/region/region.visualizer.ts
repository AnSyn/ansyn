import * as turf from '@turf/turf';
import { combineLatest, EMPTY, merge, Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { FeatureCollection, GeometryObject, Position } from 'geojson';
import { primaryAction as mouseClickCondition } from 'ol/events/condition'
import {
	ContextMenuTriggerAction,
	MapActionTypes,
	selectActiveMapId,
	selectIsMinimalistViewMode,
	selectMaps,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { VisualizerInteractions } from '@ansyn/imagery';
import Draw from 'ol/interaction/Draw';
import { AutoSubscription } from 'auto-subscriptions';
import { distinctUntilChanged, filter, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersProjectionService } from '@ansyn/ol';
import { IGeoFilterStatus, selectGeoFilterStatus } from '../../../../../status-bar/reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { SetOverlaysCriteriaAction } from '../../../../../overlays/actions/overlays.actions';
import { selectRegion } from '../../../../../overlays/reducers/overlays.reducer';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';
import { LayersActionTypes, SetLayerSelection } from '../../../../../menu-items/layers-manager/actions/layers.actions';
import { regionLayerId } from '../../../../../menu-items/layers-manager/models/layers.model';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	selfIntersectMessage = 'Invalid Polygon (Self-Intersect)';
	newRegionSelect$ = this.store$.select(selectRegion);

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	isOverlayDisplay$ = this.store$.select(selectMaps).pipe(
		map((maps) => maps[this.mapId] && Boolean(maps[this.mapId].data.overlay)),
	);

	selectGeoFilter$ = this.store$.select(selectGeoFilterStatus);

	regionLayersSelectedChange$ = this.actions$.pipe(
		ofType<SetLayerSelection>(LayersActionTypes.SET_LAYER_SELECTION),
		filter(action => action.payload.id === regionLayerId),
		map((action) => action.payload.value)
	);

	isMinimalisticView$ = this.store$.select(selectIsMinimalistViewMode).pipe(
		map(IsMinimalistView => !IsMinimalistView)
	);

	shouldDraw$: Observable<boolean> = combineLatest([this.selectGeoFilter$, this.isOverlayDisplay$]).pipe(
		map(this.shouldDrawRegion.bind(this))
	);

	@AutoSubscription
	updateLayer$: Observable<any> = merge(this.isMinimalisticView$, this.regionLayersSelectedChange$).pipe(
		tap((show) => this.setVisibility(show))
	);

	@AutoSubscription
	onContextMenu$: Observable<any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.selectGeoFilter$),
		filter(([action, geoFilter]) => this.isTheRightVisualizer(geoFilter)),
		map(([{ payload }]) => payload),
		tap(this.onContextMenu.bind(this))
	);

	@AutoSubscription
	interactionChanges$: Observable<any> = combineLatest([this.selectGeoFilter$, this.isActiveMap$]).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = combineLatest([this.newRegionSelect$, this.shouldDraw$]).pipe(
		mergeMap(this.drawChanges.bind(this))
	);

	protected constructor(public store$: Store<any>, public actions$: Actions, public projectionService: OpenLayersProjectionService, public geoFilter: CaseGeoFilter) {
		super();
	}

	drawChanges([region, shouldDraw]) {
		if (shouldDraw) {
			return this.drawRegionOnMap(region);
		}
		this.clearEntities();
		return EMPTY;
	}

	onDrawEndEvent({ feature }) {
		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject).pipe(
			take(1),
			tap((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				const region = this.createRegion(geoJsonFeature);
				if (region.geometry.type === 'Point' || turf.kinks(region.geometry).features.length === 0) {  // turf way to check if there are any self-intersections
					this.store$.dispatch(new UpdateGeoFilterStatus({ active: false }));
					this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
				} else {
					this.store$.dispatch(new SetToastMessageAction({
						toastText: this.selfIntersectMessage
					}));
				}
			})
		).subscribe();
	}

	createDrawInteraction() {
		const drawInteractionHandler = new Draw(<any>{
			type: this.geoFilter,
			condition: mouseClickCondition,
			style: this.featureStyle.bind(this),
			minPoints: this.geoFilter === CaseGeoFilter.Polygon ? 2 : 1
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	public removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	resetInteractions() {
		super.resetInteractions();
		this.store$.dispatch(new UpdateGeoFilterStatus({ active: false }));
	}

	interactionChanges([geoFilter, isActiveMap]: [IGeoFilterStatus, boolean]): void {
		this.removeDrawInteraction();
		if (geoFilter.type === this.geoFilter && geoFilter.active && isActiveMap) {
			this.createDrawInteraction();
		}
	}

	onDispose() {
		this.removeDrawInteraction();
		super.onDispose();
	}

	shouldDrawRegion([geoFilter, isOverlayDisplay]) {
		return this.isTheRightVisualizer(geoFilter) && !geoFilter.active
	}

	isTheRightVisualizer(geoFilter: IGeoFilterStatus): boolean {
		return geoFilter.type === this.geoFilter
	}

	abstract drawRegionOnMap(region: CaseRegionState): Observable<boolean> ;

	abstract onContextMenu(point: Position): void;

	abstract createRegion(geoJsonFeature: any): any;
}
