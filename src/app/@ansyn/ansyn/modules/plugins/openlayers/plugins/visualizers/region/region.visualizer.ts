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
import { SearchMode, SearchModeEnum } from '../../../../../status-bar/models/search-mode.enum';
import {
	selectGeoFilterIndicator,
	selectGeoFilterSearchMode
} from '../../../../../status-bar/reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { SetOverlaysCriteriaAction } from '../../../../../overlays/actions/overlays.actions';
import { selectRegion } from '../../../../../overlays/reducers/overlays.reducer';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	selfIntersectMessage = 'Invalid Polygon (Self-Intersect)';
	region$ = this.store$.select(selectRegion);

	geoFilter$: Observable<any> = this.region$.pipe(
		map((region) => region.type),
		distinctUntilChanged()
	);

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	isActiveGeoFilter$ = this.geoFilter$
		.pipe(map((geoFilter: CaseGeoFilter) => geoFilter === this.geoFilter));

	geoFilterSearch$: Observable<SearchMode> = this.store$.select(selectGeoFilterSearchMode);

	onSearchMode$ = this.geoFilterSearch$.pipe(
		map((geoFilterSearch) => geoFilterSearch === this.geoFilter),
		distinctUntilChanged()
	);

	geoFilterIndicator$ = this.store$.select(selectGeoFilterIndicator);

	@AutoSubscription
	onContextMenu$: Observable<any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isActiveGeoFilter$),
		filter(([action, isActiveGeoFilter]) => isActiveGeoFilter),
		map(([{ payload }]) => payload),
		tap(this.onContextMenu.bind(this))
	);

	@AutoSubscription
	interactionChanges$: Observable<any> = combineLatest(this.onSearchMode$, this.isActiveMap$).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = combineLatest(this.geoFilter$, this.region$, this.geoFilterIndicator$, this.geoFilterSearch$, this.store$.select(selectIsMinimalistViewMode)).pipe(
		mergeMap(this.drawChanges.bind(this)));

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: OpenLayersProjectionService, public geoFilter: CaseGeoFilter) {
		super();
	}

	drawChanges([geoFilter, region, geoFilterIndicator, geoFilterSearch, isMinimalistViewMode]) {
		if (!geoFilterIndicator || geoFilterSearch !== SearchModeEnum.none || isMinimalistViewMode) {
			this.clearEntities();
			return EMPTY;
		}
		if (geoFilter === this.geoFilter) {
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
					this.store$.dispatch(new UpdateGeoFilterStatus());
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
		this.store$.dispatch(new UpdateGeoFilterStatus());
	}

	interactionChanges([onSearchMode, isActiveMap]: [boolean, boolean]): void {
		this.removeDrawInteraction();
		if (onSearchMode && isActiveMap) {
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
