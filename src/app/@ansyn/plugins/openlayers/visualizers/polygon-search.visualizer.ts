import { EntitiesVisualizer } from './entities-visualizer';
import Draw from 'ol/interaction/draw';
import {
	ComboBoxesProperties,
	IStatusBarState,
	StatusBarActionsTypes,
	statusBarFlagsItemsEnum,
	UpdateStatusFlagsAction
} from 'app/@ansyn/status-bar/index';
import { Observable } from 'rxjs/Observable';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Feature, FeatureCollection, GeometryObject, Polygon } from 'geojson';
import { OverlaysCriteria, SetOverlaysCriteriaAction } from 'app/@ansyn/core/index';
import { statusBarStateSelector } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { CaseRegionState, coreStateSelector, ICoreState } from '@ansyn/core';
import { UUID } from 'angular2-uuid';

export class PolygonSearchVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;

	core$ = this.store$.select(coreStateSelector);

	statusBar$ = this.store$.select(statusBarStateSelector);

	flags$ = this.statusBar$
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	geoFilterIndicator$ = this.flags$
		.map(flags => flags.get(statusBarFlagsItemsEnum.geoFilterIndicator))
		.distinctUntilChanged();

	region$ = this.core$
		.pluck<ICoreState, OverlaysCriteria>('overlaysCriteria')
		.distinctUntilChanged()
		.pluck<OverlaysCriteria, CaseRegionState>('region')
		.distinctUntilChanged();

	geoFilter$: Observable<any> = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, ComboBoxesProperties>('comboBoxesProperties')
		.distinctUntilChanged()
		.map((comboBoxesProperties) => comboBoxesProperties.geoFilter)
		.distinctUntilChanged();


	resetInteraction$: Observable<any> = this.actions$
		.ofType<UpdateStatusFlagsAction>(StatusBarActionsTypes.UPDATE_STATUS_FLAGS)
		.filter(action => action.payload.key === statusBarFlagsItemsEnum.polygonSearch)
		.withLatestFrom(this.flags$)
		.do(([action, flags]) => {
			this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
			const isPolygonSearch = flags.get(statusBarFlagsItemsEnum.polygonSearch);
			if (isPolygonSearch) {
				const drawInteractionHandler = new Draw({
					type: 'Polygon',
					condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
					style: this.featureStyle.bind(this)
				});
				drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
			}
		});

	constructor(public store$: Store<any>,
				public actions$: Actions) {

		super(null, {
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

	drawSearchPolygon(region: CaseRegionState): Observable<boolean> {
		const id = UUID.UUID();

		const featureJson: Feature<Polygon> = {
			type: 'Feature',
			geometry: <any>region,
			properties: {}
		};
		const entityToDraw = <any> { id, featureJson };
		return this.setEntities([entityToDraw]);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.geoFilterIndicator$
				.withLatestFrom(this.geoFilter$, this.region$, (geoFilterIndicator, geoFilter, region) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),

			this.region$
				.withLatestFrom(this.geoFilter$, this.geoFilterIndicator$, (region, geoFilter, geoFilterIndicator) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),

			this.geoFilter$
				.withLatestFrom(this.region$, this.geoFilterIndicator$, (geoFilter, region, geoFilterIndicator) => [
					geoFilter,
					region,
					geoFilterIndicator
				])
				.mergeMap(this.onChanges.bind(this))
				.subscribe(),

			this.resetInteraction$.subscribe()
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

	onChanges([geoFilter, region, geoFilterIndicator]) {
		if (!geoFilterIndicator) {
			this.clearEntities();
			return Observable.empty();
		}
		if (geoFilter === 'Polygon') {
			return this.drawSearchPolygon(region);
		}
		this.clearEntities();
		return Observable.empty();
	}

}
