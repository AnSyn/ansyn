import Draw from 'ol/interaction/draw';
import { StatusBarActionsTypes, statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from 'app/@ansyn/status-bar/index';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { FeatureCollection, GeometryObject } from 'geojson';
import { SetOverlaysCriteriaAction } from 'app/@ansyn/core/index';
import { CaseRegionState } from 'app/@ansyn/core/index';
import { UUID } from 'angular2-uuid';
import { RegionVisualizer } from 'app/@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { mapStateSelector } from '@ansyn/map-facade';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

export class PolygonSearchVisualizer extends RegionVisualizer {
	static fillAlpha = 0.4;
	drawInteractionHandler: Draw;

	mapState$ = this.store$.select(mapStateSelector);

	isPolygonSearch$ = this.flags$
		.map((flags) => flags.get(statusBarFlagsItemsEnum.polygonSearch))
		.distinctUntilChanged();

	isActiveMap$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();


	activeMapChange$: Observable<any> = Observable.combineLatest(this.isActiveMap$, this.isPolygonSearch$)
		.do(this.onActiveMapChange.bind(this));

	resetInteraction$: Observable<any> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItemsEnum.polygonSearch)
		.withLatestFrom(this.flags$)
		.do(([action, flags]) => {
			this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
			const isPolygonSearch = flags.get(statusBarFlagsItemsEnum.polygonSearch);
			if (isPolygonSearch) {
				this.createDrawEndEvent();
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, this.drawInteractionHandler);
			}
		});



	constructor(public store$: Store<any>,
				public actions$: Actions) {

		super(store$, actions$, 'Polygon');

		this.updateStyle({
			initial: {
				stroke: {
					color: '#27b2cfe6',
					width: 1
				},
				fill: {
					color: `rgba(255, 255, 255, ${PolygonSearchVisualizer.fillAlpha})`
				},
				point: {
					radius: 4
				},
				line: {
					width: 1
				}
			}
		});
	}

	public createDrawEndEvent() {
		return this.drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));

	}

	public removeDrawEndEvent() {
		return this.drawInteractionHandler.un('drawend', this.onDrawEndEvent.bind(this));
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const id = UUID.UUID();
		const featureJson = turf.polygon(region.coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	onInit() {
		super.onInit();
		this.drawInteractionHandler = new Draw({
			type: 'Polygon',
			condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
			style: this.featureStyle.bind(this)
		});
		this.subscriptions.push(
			this.resetInteraction$.subscribe(),
			this.activeMapChange$.subscribe()
		);
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.polygonSearch }));

		this.iMap.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.take(1)
			.do((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				this.store$.dispatch(new SetOverlaysCriteriaAction({ region: geoJsonFeature.geometry }));
			})
			.subscribe();
	}

	onActiveMapChange([isActiveMap, isPolygonSearch]: [boolean, boolean]) {
		if (isPolygonSearch) {
			this.removeInteraction(VisualizerInteractions.drawInteractionHandler);

			if (isActiveMap) {
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, this.drawInteractionHandler);
			}
		}
	}

	onDispose() {
		this.removeDrawEndEvent();
		super.onDispose();
	}
}
