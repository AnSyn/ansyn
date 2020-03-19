import {
	IIcon,
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	VisualizerInteractions,
	VisualizersConfig
} from '@ansyn/imagery';
import { cloneDeep as _cloneDeep } from 'lodash';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Point from 'ol/geom/Point';
import * as condition from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MultiLineString } from 'geojson';
import { distinctUntilChanged, pluck, tap } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '@ansyn/ol';
import { BaseFootprintsVisualizer } from './base-footprints-visualizer';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '../../../../../overlays/actions/overlays.actions';
import {
	IMarkUpData,
	IOverlaysState,
	MarkUpClass,
	overlaysStateSelector
} from '../../../../../overlays/reducers/overlays.reducer';
import { ExtendMap } from '../../../../../overlays/reducers/extendedMap.class';
import { OverlaysService } from '../../../../../overlays/services/overlays.service';
import { getIconSvg } from './arrow-svg';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, VisualizersConfig, OverlaysService]
})
export class FootprintPolylineVisualizer extends BaseFootprintsVisualizer {
	markups: ExtendMap<MarkUpClass, IMarkUpData>;
	overlaysState$: Observable<IOverlaysState> = this.store.select(overlaysStateSelector);
	@AutoSubscription
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, IMarkUpData>> = this.overlaysState$.pipe(
		pluck<IOverlaysState, ExtendMap<MarkUpClass, IMarkUpData>>('dropsMarkUp'),
		distinctUntilChanged(),
		tap((markups) => this.markups = markups)
	);
	protected disableCache = true;
	ghostId: string;

	constructor(public store: Store<any>,
				@Inject(VisualizersConfig) public config: IVisualizersConfig,
				public overlaysService: OverlaysService
	) {

		super(store, overlaysService, 'Polygon', config.FootprintPolylineVisualizer);

		this.updateStyle({
			opacity: 0.5,
			initial: {
				zIndex: this.getZIndex.bind(this),
				fill: this.getFillColor.bind(this),
				stroke: this.getStrokeColor.bind(this),
				'stroke-width': this.getStrokeWidth.bind(this),
				'stroke-opacity': this.getStrokeOpacity.bind(this),
				shadow: this.getShadow.bind(this),
				circle: this.getRadius.bind(this),
				icon: this.getImage.bind(this),
				geometry: this.getGeometry.bind(this)
			}
		});
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		const conversion = this.convertPolygonToPolyline(logicalEntities);
		return super.addOrUpdateEntities(conversion);
	}

	createPointerMoveInteraction() {
		const pointerMove = new Select({
			condition: condition.pointerMove,
			style: () => new Style(),
			layers: [this.vector]
		});
		pointerMove.on('select', this.onSelectFeature.bind(this));
		return pointerMove;
	}

	onDoubleClickFeature($event) {
		this.purgeCache();

		if ($event.selected.length > 0) {
			const feature = $event.selected[0];
			const id = feature.getId();
			this.store.dispatch(new DisplayOverlayFromStoreAction({ id }));
		}
	}

	createDoubleClickInteraction() {
		const doubleClick = new Select({
			condition: condition.doubleClick,
			style: () => new Style({}),
			layers: [this.vector]
		});
		doubleClick.on('select', this.onDoubleClickFeature.bind(this));
		return doubleClick;
	}

	onDispose(): void {
		this.removeInteraction(VisualizerInteractions.doubleClick);
		this.removeInteraction(VisualizerInteractions.pointerMove);
	}

	/**
	 * Explanation:
	 * 1. This is a callback function, which may get either a select event or an unselect event
	 * 2. Our features are clipped to the extent. But we get events also from outside the extent,
	 * so we need to handle those.
	 * 3. If we get a select event, we check whether it comes from within the extent. If yes, we
	 * fire an action to update the store. If not, we just assign the feature's id to an internal var, ghostId.
	 * 4. If we get an unselect event, we check whether the associated feature's id is equal to ghostId. If yes,
	 * it means that a "ghost" feature outside the extent was unselected. In that case, we just clear the ghostId var.
	 * Otherwise, we fire an action to update the store.
	 * 5. Note that, in the case of an unselect event, we should not check whether it comes from within the
	 * extent or not. Because we may can a real (not ghost) unselect event simply by moving the mouse from the extent
	 * outside. In that case the location of the event will be outside the extent, but it will be a unselect event of
	 * a feature which is inside the extent.
	 */
	onSelectFeature($event) {
		if ($event.selected.length > 0) {
			const id = $event.selected[0].getId();
			if (this.isMouseEventInExtent($event)) {
				this.store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [id] } }));
			} else {
				this.ghostId = id;
			}
		} else {
			if (this.ghostId) {
				this.ghostId = undefined;
			} else {
				this.store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
			}
		}
	}

	public purgeCache(feature?: Feature) {
		if (feature) {
			delete (<any>feature).styleCache;
		} else if (this.source) {
			let features = this.source.getFeatures();
			features.forEach(f => this.purgeCache(f));
		}
	}

	protected resetInteractions(): void {
		this.removeInteraction(VisualizerInteractions.doubleClick);
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.addInteraction(VisualizerInteractions.pointerMove, this.createPointerMoveInteraction());
		this.addInteraction(VisualizerInteractions.doubleClick, this.createDoubleClickInteraction());
	}

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
			console.warn(`polyline-visualizer.ts getFeatureType - unsupported type ${ type }`);
		}
		return type;
	}

	private getRadius(feature: Feature, hover = false) {
		if (this.getFeatureType(feature) === 'Point') {
			return hover ? 8 : 7;
		}
		return undefined;
	}

	private getZIndex(feature: Feature) {
		const { isActive, isFavorites, isDisplayed } = this.propsByFeature(feature);

		return isActive ? 4 : isFavorites ? 3 : isDisplayed ? 2 : 1;
	}

	private getFillColor(feature: Feature, hover = false) {
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

	private getStrokeColor(feature: Feature, hover = false) {
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

	private getStrokeOpacity(feature: Feature, hover = false) {
		return 1;
	}

	private getStrokeWidth(feature: Feature, hover = false) {
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

	private getImage(feature, hover = false): IIcon | undefined {
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

	private getGeometry(feature: Feature) {
		if (this.getFeatureType(feature) === 'LineString') {
			const coordinates = feature.getGeometry().getCoordinates();
			return new Point(coordinates[0])
		}
		return undefined;
	}

	private calcArrowAngle(previousPoint: [number, number], currentPoint: [number, number]): number {
		const dx = currentPoint[0] - previousPoint[0];
		const dy = currentPoint[1] - previousPoint[1];
		return Math.atan2(dx, dy);
	}

	private getShadow(feature: Feature) {
		const { isFavorites } = this.propsByFeature(feature);

		if (!isFavorites) {
			return;
		}

		return {
			'stroke-width': 5,
			stroke: this.visualizerStyle.colors.favorite
		};
	}

	private convertPolygonToPolyline(logicalEntities: IVisualizerEntity[]): IVisualizerEntity[] {
		const clonedLogicalEntities = _cloneDeep(logicalEntities);
		clonedLogicalEntities
			.filter((entity: IVisualizerEntity) => entity.featureJson.geometry.type === 'MultiPolygon')
			.forEach((entity: IVisualizerEntity) => {
				let geometry: MultiLineString = entity.featureJson.geometry;
				geometry.type = 'MultiLineString';
				geometry.coordinates = <any>geometry.coordinates[0];
			});
		return clonedLogicalEntities;
	}
}
