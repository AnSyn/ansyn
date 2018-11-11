import * as turf from '@turf/turf';
import { EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { FeatureCollection, GeometryObject } from 'geojson';
import { selectActiveMapId } from '@ansyn/map-facade';
import { ImageryVisualizer, ProjectionService, VisualizerInteractions } from '@ansyn/imagery';
import Draw from 'ol/interaction/draw';
import { getPointByGeometry } from '@ansyn/core';
import { AutoSubscription } from 'auto-subscriptions';
import { distinctUntilChanged, map, mergeMap, take, tap } from 'rxjs/operators';
import { EntitiesVisualizer } from '../entities-visualizer';
import {
	selectAlgorithmTaskDrawIndicator,
	selectAlgorithmTaskRegion,
	SetAlgorithmTaskDrawIndicator,
	SetAlgorithmTaskRegion
} from '@ansyn/menu-items';
import { combineLatest } from 'rxjs/index';
import { OpenLayersMap } from '../../open-layers-map/openlayers-map/openlayers-map';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import Feature from 'ol/feature';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class AlgorithmTaskRegionVisualizer extends EntitiesVisualizer {
	_iconSrc: Style = new Style({
		image: new Icon({
			scale: 1,
			src: 'assets/pinpoint-indicator.svg'
		}),
		zIndex: 100
	});

	region$ = this.store$.select(selectAlgorithmTaskRegion);

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	drawIndicator$ = this.store$.select(selectAlgorithmTaskDrawIndicator);

	@AutoSubscription
	interactionChanges$: Observable<any> = combineLatest(this.isActiveMap$, this.drawIndicator$).pipe(
		tap(this.interactionChanges.bind(this))
	);

	@AutoSubscription
	drawChanges$ = combineLatest(this.region$, this.drawIndicator$).pipe(
		mergeMap(this.drawChanges.bind(this)));

	constructor(public store$: Store<any>, public actions$: Actions, public projectionService: ProjectionService) {
		super();
	}

	drawChanges([region, drawIndicator]) {
		if (!region) {
			this.clearEntities();
			return EMPTY;
		}
		return this.drawRegionOnMap(region);
	}

	onDrawEndEvent({ feature }) {
		this.store$.dispatch(new SetAlgorithmTaskDrawIndicator(false));

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap).pipe(
			take(1),
			tap((featureCollection: FeatureCollection<GeometryObject>) => {
				const [geoJsonFeature] = featureCollection.features;
				const region = this.createRegion(geoJsonFeature);
				this.store$.dispatch(new SetAlgorithmTaskRegion(region));
			})
		).subscribe();
	}

	createDrawInteraction() {
		const drawInteractionHandler = new Draw({
			type: 'Point',
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
		this.store$.dispatch(new SetAlgorithmTaskDrawIndicator(false));
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

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}

	drawRegionOnMap(region: GeometryObject): Observable<boolean> {
		const coordinates = getPointByGeometry(region).coordinates;
		const id = 'algorithmTaskRegion';
		const featureJson = turf.point(coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion(geoJsonFeature: any): any {
		return geoJsonFeature.geometry;
	}
}
