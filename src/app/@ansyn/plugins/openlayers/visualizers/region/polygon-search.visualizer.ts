import Draw from 'ol/interaction/draw';
import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from 'app/@ansyn/status-bar/index';
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
import { Position } from 'geojson';

export class PolygonSearchVisualizer extends RegionVisualizer {
	static fillAlpha = 0.4;

	mapState$ = this.store$.select(mapStateSelector);

	isActiveMap$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();

	activeMapChange$: Observable<any> = Observable.combineLatest(this.isActiveMap$, this.onSearchMode$)
		.do(this.onActiveMapChange.bind(this));

	resetInteraction$: Observable<any> = Observable.combineLatest(this.onSearchMode$, this.isActiveMap$)
		.filter(([onSearchMode, isActiveMap]: [boolean, boolean]) => isActiveMap)
		.do(([isPolygonSearch]) => {
			this.clearOrResetPolygonDraw(isPolygonSearch);
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

	createDrawInteraction() {
		this.vector.setOpacity(0);
		const drawInteractionHandler = new Draw({
			type: 'Polygon',
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

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const id = UUID.UUID();
		const featureJson = turf.polygon(region.coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.resetInteraction$.subscribe(),
			this.activeMapChange$.subscribe()
		);
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));

		this.iMap.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.take(1)
			.do((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				this.store$.dispatch(new SetOverlaysCriteriaAction({ region: geoJsonFeature.geometry }));
				this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
			})
			.subscribe();
	}

	onActiveMapChange([isActiveMap, onSearchMode]: [boolean, boolean]) {
		this.removeDrawInteraction();
		if (onSearchMode && isActiveMap) {
			this.createDrawInteraction()
		}
	}

	resetInteractions() {
		super.resetInteractions();
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));
	}

	clearOrResetPolygonDraw(isPolygonSearch: boolean) {
		this.removeDrawInteraction();
		if (isPolygonSearch) {
			this.createDrawInteraction();
		}
	}

	onContextMenu(point: Position): void {
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: true }));
	}

	onDispose() {
		this.removeDrawInteraction();
		super.onDispose();
	}
}
