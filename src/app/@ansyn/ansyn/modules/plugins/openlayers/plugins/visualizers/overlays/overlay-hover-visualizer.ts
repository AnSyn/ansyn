import { Observable, of } from 'rxjs';
import { Inject } from '@angular/core';
import { IIcon, ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/imagery-ol';
import { ExtendMap } from "../../../../../overlays/reducers/extendedMap.class";
import { IMarkUpData, MarkUpClass, selectDropMarkup } from "../../../../../overlays/reducers/overlays.reducer";
import { OverlaysService } from "../../../../../overlays/services/overlays.service";
import { IOverlay } from "../../../../../overlays/models/overlay.model";
import { UUID } from "angular2-uuid";
import { feature } from '@turf/turf';
import { getIconSvg } from "./arrow-svg";
import Feature from 'ol/Feature';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, VisualizersConfig, OverlaysService]
})
export class OverlayHoverVisualizer extends EntitiesVisualizer {
	markups: ExtendMap<MarkUpClass, IMarkUpData>;

	@AutoSubscription
	hoveredOverlay$: Observable<boolean> = this.store$.pipe(
		select(selectDropMarkup),
		tap((markups: ExtendMap<MarkUpClass, IMarkUpData>) => { this.markups = markups; }),
		map((markups: ExtendMap<MarkUpClass, IMarkUpData>) => markups && markups.get(MarkUpClass.hover)),
		map((markUpData: IMarkUpData) => markUpData && markUpData.overlaysIds[0]),
		withLatestFrom(this.overlaysService.getAllOverlays$),
		map(([overlayId, overlays]: [string, Map<string, IOverlay>]) => overlayId && overlays.get(overlayId)),
		switchMap((overlay: IOverlay) => {
				return this.showOrHide$(overlay);
			}
		)
	);

	constructor(
		public store$: Store<any>,
		public actions$: Actions,
		@Inject(VisualizersConfig) config: IVisualizersConfig,
		public overlaysService: OverlaysService
	) {
		super(config.OverlayHoverVisualizer);
		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: 4,
				circle: (feature) => this.getRadius(feature, true),
				fill: (feature) => this.getFillColor(feature, true),
				'fill-opacity': (feature) => this.getFillOpacity(feature, true),
				'stroke-width': (feature) => this.getStrokeWidth(feature, true),
				'stroke': (feature) => this.getStrokeColor(feature, true),
				'stroke-opacity': (feature) => this.getStrokeOpacity(feature, true),
				icon: (feature) => this.getImage(feature, true),
			}
		});
	}

	private showOrHide$(hoveredOverlay: IOverlay): Observable<boolean> {
		if (hoveredOverlay) {
			const featureJson = feature(hoveredOverlay.footprint);
			const entityToDraw = {id: UUID.UUID(), featureJson};
			return this.setEntities([entityToDraw]);
		} else {
			this.clearEntities();
			return of(true);
		}
	}

	// Start: code duplicated from polyline-visualizer

	private propsByFeature(feature: Feature) {
		const classes = this.markups.findKeysByValue(<string>feature.getId(), 'overlaysIds');

		const isFavorites = classes.includes(MarkUpClass.favorites);
		const isActive = classes.includes(MarkUpClass.active);
		const isDisplayed = classes.includes(MarkUpClass.displayed);

		return { isFavorites, isActive, isDisplayed };
	}

	private getFeatureType(feature: Feature): 'MultiLineString' | 'Point' | 'LineString' | 'MultiPolygon' {
		const type = feature && feature.getGeometry().getType();
		if (type && !['MultiLineString', 'Point', 'LineString', 'MultiPolygon'].includes(type)) {
			console.warn(`polyline-visualizer.ts getFeatureType - unsupported type ${type}`);
		}
		return type;
	}

	private getRadius(feature: Feature, hover = true) {
		if (this.getFeatureType(feature) === 'Point') {
			return hover ? 8 : 7;
		}
		return undefined;
	}

	private getFillOpacity(feature: Feature, hover = true) {
		switch (this.getFeatureType(feature)) {
			case 'MultiLineString':
			case 'MultiPolygon':
				return hover ? 0.4 : 1;
			case 'Point' :
				return hover ? 1 : 0.8;
			case 'LineString':
				return undefined;
			default:
				return 1;
		}
	}

	private getFillColor(feature: Feature, hover = true) {
		const { active, display, favorite, inactive } = this.visualizerStyle.colors;
		const { isActive, isFavorites, isDisplayed } = this.propsByFeature(feature);
		switch (this.getFeatureType(feature)) {
			case 'MultiLineString':
			case 'MultiPolygon':
				return hover ? 'white' : 'transparent';
			case 'Point' :
				return isFavorites ? favorite : isActive ? active : !isDisplayed ? inactive : display;
			case 'LineString':
				return undefined;
		}
	}

	private getStrokeColor(feature: Feature, hover = true) {
		const { active, display, favorite, inactive } = this.visualizerStyle.colors;
		const { isActive, isDisplayed, isFavorites } = this.propsByFeature(feature);

		switch (this.getFeatureType(feature)) {
			case 'MultiLineString':
			case 'MultiPolygon':
			case 'LineString':
				return isFavorites ? favorite : isDisplayed ? display : isActive ? active : inactive;
			case 'Point' :
				return display;
		}
	}

	private getStrokeOpacity(feature: Feature, hover = true) {
		return 1;
	}

	private getStrokeWidth(feature: Feature, hover = true) {
		const { isActive, isDisplayed, isFavorites } = this.propsByFeature(feature);
		switch (feature.getGeometry().getType()) {
			case 'MultiLineString':
			case 'MultiPolygon':
				return isFavorites ? 4 : (isActive || isDisplayed || hover) ? 5 : 3;
			case 'Point' :
				return undefined;
			case 'LineString':
				return hover ? 7 : 5;
		}
	}

	private getImage(feature, hover = true): IIcon | undefined {
		if (this.getFeatureType(feature) === 'LineString') {
			const coordinates = feature.getGeometry().getCoordinates();
			const rotation = this.calcArrowAngle(coordinates[0], coordinates[1]);
			const color = this.getStrokeColor(feature);
			return {
				src: getIconSvg(hover ? this.colorWithAlpha(color, 0.5) : color),
				anchor: [0.5, 0.5],
				scale: 0.15,
				rotation,
				rotateWithView: true
			}
		}
		return undefined;
	}

	private calcArrowAngle(previousPoint: [number, number], currentPoint: [number, number]): number {
		const dx = currentPoint[0] - previousPoint[0];
		const dy = currentPoint[1] - previousPoint[1];
		return Math.atan2(dx, dy);
	}

	// End: code duplicated from polyline-visualizer
}
