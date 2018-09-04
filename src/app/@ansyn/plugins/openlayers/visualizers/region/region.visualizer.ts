import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import * as turf from '@turf/turf';
import { empty, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { FeatureCollection, GeometryObject, Position } from 'geojson';
import { selectActiveMapId } from '@ansyn/map-facade/reducers/map.reducer';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import Draw from 'ol/interaction/draw';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { selectRegion } from '@ansyn/core/reducers/core.reducer';
import { CaseGeoFilter, CaseRegionState } from '@ansyn/core/models/case.model';
import { ContextMenuTriggerAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { SetOverlaysCriteriaAction, SetToastMessageAction } from '@ansyn/core/actions/core.actions';
import { selectGeoFilterIndicator, selectGeoFilterSearchMode } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';
import { SearchModeEnum } from '@ansyn/status-bar/models/search-mode.enum';
import { AutoSubscription } from 'auto-subscriptions';
import { filter, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	selfIntersectMessage = 'Invalid Polygon (Self-Intersect)';
	region$ = this.store$.select(selectRegion);

	geoFilter$: Observable<any> = this.region$.map((region) => region.type)
		.distinctUntilChanged();

	isActiveMap$ = this.store$.select(selectActiveMapId)
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();

	isActiveGeoFilter$ = this.geoFilter$
		.map((geoFilter: CaseGeoFilter) => geoFilter === this.geoFilter);

	geoFilterSearch$ = this.store$.select(selectGeoFilterSearchMode);

	@AutoSubscription
	toggleOpacity$ = this.geoFilterSearch$
		.do((geoFilterSearch) => {
			if (geoFilterSearch !== SearchModeEnum.none) {
				this.vector.setOpacity(0);
			} else {
				this.vector.setOpacity(1);
			}
		});

	onSearchMode$ = this.geoFilterSearch$
		.map((geoFilterSearch) => geoFilterSearch === this.geoFilter)
		.distinctUntilChanged();

	geoFilterIndicator$ = this.store$.select(selectGeoFilterIndicator);

	@AutoSubscription
	onContextMenu$: Observable<any> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isActiveGeoFilter$),
		filter(([action, isActiveGeoFilter]) => isActiveGeoFilter),
		map(([{ payload }]) => payload),
		tap((payload) => {
			this.onContextMenu(payload);
		})
	);

	@AutoSubscription
	interactionChanges$: Observable<any> = Observable.combineLatest(this.onSearchMode$, this.isActiveMap$).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = Observable
		.combineLatest(this.geoFilter$, this.region$, this.geoFilterIndicator$).pipe(
			mergeMap(this.drawChanges.bind(this))
		);

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService, public geoFilter: CaseGeoFilter) {
		super();
	}

	drawChanges([geoFilter, region, geoFilterIndicator]) {
		if (!geoFilterIndicator) {
			this.clearEntities();
			return empty();
		}
		if (geoFilter === this.geoFilter) {
			return this.drawRegionOnMap(region);
		}
		this.clearEntities();
		return empty();
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(new UpdateGeoFilterStatus());

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap).pipe(
			take(1),
			tap((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				const region = this.createRegion(geoJsonFeature);
				if (region.type === 'Point' || turf.kinks(region).features.length === 0) {  // turf way to check if there are any self-intersections
					this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
				}
				else {
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
			condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
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
