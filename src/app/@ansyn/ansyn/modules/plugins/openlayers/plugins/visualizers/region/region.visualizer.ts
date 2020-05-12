import * as turf from '@turf/turf';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { FeatureCollection, GeometryObject, Position } from 'geojson';
import {
	ContextMenuTriggerAction,
	MapActionTypes,
	selectActiveMapId,
	selectIsMinimalistViewMode,
	SetToastMessageAction
} from '@ansyn/map-facade';
import { VisualizerInteractions } from '@ansyn/imagery';
import Draw from 'ol/interaction/Draw';
import { AutoSubscription } from 'auto-subscriptions';
import { distinctUntilChanged, filter, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersProjectionService } from '@ansyn/ol';
import {
	selectGeoFilterActive,
	selectGeoFilterType
} from '../../../../../status-bar/reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { SetOverlaysCriteriaAction } from '../../../../../overlays/actions/overlays.actions';
import { selectRegion } from '../../../../../overlays/reducers/overlays.reducer';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	selfIntersectMessage = 'Invalid Polygon (Self-Intersect)';
	newRegionSelect$ = this.store$.select(selectRegion);

	regionSameAsVisualizer$ = this.newRegionSelect$.pipe(
		map( region => region.type === this.geoFilter)
	);

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	geoFilterType$: Observable<CaseGeoFilter> = this.store$.select(selectGeoFilterType);

	geoFilterActive$ = this.store$.select(selectGeoFilterActive);

	isTheRightVisualizer$ = this.geoFilterType$.pipe(
		map( geoFilter => geoFilter === this.geoFilter)
	);

	@AutoSubscription
	onContextMenu$: Observable<any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isTheRightVisualizer$),
		filter(([action, rightVisualizer]) => Boolean(rightVisualizer)),
		map(([{ payload }]) => payload),
		tap(this.onContextMenu.bind(this))
	);

	@AutoSubscription
	interactionChanges$: Observable<any> = combineLatest(this.geoFilterType$, this.geoFilterActive$, this.isActiveMap$).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = combineLatest(this.newRegionSelect$, this.regionSameAsVisualizer$, this.geoFilterActive$, this.store$.select(selectIsMinimalistViewMode)).pipe(
		mergeMap(this.drawChanges.bind(this))
	);

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: OpenLayersProjectionService, public geoFilter: CaseGeoFilter) {
		super();
	}

	drawChanges([region, regionAsVisualizer, isActive, , isMinimalistViewMode]) {
		if (regionAsVisualizer && !isActive && !isMinimalistViewMode) {
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
				if (region.type === 'Point' || turf.kinks(region).features.length === 0) {  // turf way to check if there are any self-intersections
					this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
					this.store$.dispatch(new UpdateGeoFilterStatus({active: false}));
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
			condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
			style: this.featureStyle.bind(this)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	public removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	resetInteractions() {
		super.resetInteractions();
		this.store$.dispatch(new UpdateGeoFilterStatus({active: false}));
	}

	interactionChanges([geoFilterSearch, isGeoActive, isActiveMap]: [CaseGeoFilter, boolean, boolean]): void {
		this.removeDrawInteraction();
		if (geoFilterSearch === this.geoFilter && isGeoActive && isActiveMap) {
			this.createDrawInteraction();
		}
	}

	onDispose() {
		this.removeDrawInteraction();
		super.onDispose();
	}

	abstract drawRegionOnMap(region: CaseRegionState): Observable<boolean> ;

	abstract onContextMenu(point: Position): void;

	abstract createRegion(geoJsonFeature: any): any;
}
