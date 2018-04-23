import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import {
	IStatusBarState, statusBarFlagsItemsEnum,
	statusBarStateSelector
} from 'app/@ansyn/status-bar/index';
import { CaseGeoFilter, CaseRegionState, coreStateSelector, ICoreState, OverlaysCriteria } from 'app/@ansyn/core/index';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ContextMenuTriggerAction, MapActionTypes, mapStateSelector } from '@ansyn/map-facade';
import { FeatureCollection, GeometryObject, Position } from 'geojson';
import { selectGeoFilter, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import { SetOverlaysCriteriaAction } from '@ansyn/core';
import Draw from 'ol/interaction/draw';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

export abstract class RegionVisualizer extends EntitiesVisualizer {
	core$ = this.store$.select(coreStateSelector);
	mapState$ = this.store$.select(mapStateSelector);

	geoFilter$: Observable<any> = this.store$.select(selectGeoFilter)
		.distinctUntilChanged();

	isActiveMap$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();

	isActiveGeoFilter$ = this.geoFilter$
		.map((geoFilter: CaseGeoFilter) => geoFilter === this.geoFilter);

	statusBarFlags$ = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	geoFilterSearch$ = this.statusBarFlags$
		.map((flags) => flags.get(statusBarFlagsItemsEnum.geoFilterSearch))
		.distinctUntilChanged();

	onSearchMode$ = Observable.combineLatest(this.geoFilterSearch$, this.isActiveGeoFilter$)
		.map(([geoFilterSearch, isActiveGeoFilter]) => geoFilterSearch && isActiveGeoFilter)
		.distinctUntilChanged();

	region$ = this.core$
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged()
		.pluck<OverlaysCriteria, CaseRegionState>('region');

	geoFilterIndicator$ = this.statusBarFlags$
		.map((flags: Map<statusBarFlagsItemsEnum, boolean>) => flags.get(statusBarFlagsItemsEnum.geoFilterIndicator))
		.distinctUntilChanged();

	onContextMenu$: Observable<any> = this.actions$
		.ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU)
		.withLatestFrom(this.isActiveGeoFilter$)
		.filter(([action, isActiveGeoFilter]: [ContextMenuTriggerAction, boolean]) => isActiveGeoFilter)
		.map(([{ payload }]) => payload)
		.do(this.onContextMenu.bind(this));

	interactionChanges$: Observable<any> = Observable.combineLatest(this.onSearchMode$, this.isActiveMap$)
		.do(this.interactionChanges.bind(this));

	drawChanges$ = Observable
		.combineLatest(this.geoFilter$, this.region$, this.geoFilterIndicator$)
		.mergeMap(this.drawChanges.bind(this));

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService, public geoFilter: CaseGeoFilter) {
		super();
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.drawChanges$.subscribe(),
			this.onContextMenu$.subscribe(),
			this.interactionChanges$.subscribe()
		)
	}

	drawChanges([geoFilter, region, geoFilterIndicator]) {
		if (!geoFilterIndicator) {
			this.clearEntities();
			return Observable.empty();
		}
		if (geoFilter === this.geoFilter) {
			return this.drawRegionOnMap(region);
		}
		this.clearEntities();
		return Observable.empty();
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.take(1)
			.do((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				const region = this.createRegion(geoJsonFeature);
				this.store$.dispatch(new SetOverlaysCriteriaAction({ region }));
			})
			.subscribe();
	}

	createDrawInteraction() {
		this.vector.setOpacity(0);
		const drawInteractionHandler = new Draw({
			type: this.geoFilter,
			condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
			style: this.featureStyle.bind(this)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	public removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.vector.setOpacity(1);
	}

	resetInteractions() {
		super.resetInteractions();
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));
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
