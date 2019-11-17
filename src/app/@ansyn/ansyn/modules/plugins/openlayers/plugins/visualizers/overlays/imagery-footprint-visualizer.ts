import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { AutoSubscription } from 'auto-subscriptions';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import CircleStyle from 'ol/style/Circle';
import * as olColor from 'ol/color';

import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { OverlaysService } from '../../../../../overlays/services/overlays.service';
import { ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { ExtendMap } from '../../../../../overlays/reducers/extendedMap.class';
import { ICaseMapState } from '../../../../../menu-items/cases/models/case.model';
import {
	IMarkUpData,
	MarkUpClass,
	selectDropMarkup,
	selectDrops
} from '../../../../../overlays/reducers/overlays.reducer';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { DisplayOverlayFromStoreAction, SetMarkUp } from '../../../../../overlays/actions/overlays.actions';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, VisualizersConfig, OverlaysService]
})
export class ImageryFootprintVisualizer extends EntitiesVisualizer {
	markups = new ExtendMap<any, any>();

	overlayDisplayMode$: Observable<string> = this.store
		.pipe(
			select(selectMapsList),
			map((mapsList: ICaseMapState[]) => MapFacadeService.mapById(mapsList, this.mapId)),
			filter(Boolean),
			map((map: ICaseMapState) => map.data.overlayDisplayMode),
			distinctUntilChanged()
		);

	@AutoSubscription
	drawOverlaysOnMap$: Observable<any> = combineLatest(this.overlayDisplayMode$, this.store.select(selectDrops))
		.pipe(
			withLatestFrom(this.overlaysService.getAllOverlays$),
			mergeMap(([[overlayDisplayMode, drops], overlays]: [[string, IOverlay[]], Map<string, IOverlay>]) => {
				if (overlayDisplayMode === 'Polygon') {
					const entities = drops
						.map(({ id }) => overlays.get(id))
						.filter(({ footprint }) => footprint.type === 'LineString' || footprint.type === 'Point')
						.map(({ id, footprint }) => this.geometryToEntity(id, footprint));
					return this.setEntities(entities);
				} else if (this.getEntities().length > 0) {
					this.clearEntities();
				}
				return EMPTY;
			})
		);

	@AutoSubscription
	dropsMarkUp$: Observable<ExtendMap<MarkUpClass, IMarkUpData>> = this.store.pipe(
		select(selectDropMarkup),
		tap((markups) => this.markups = markups),
		tap(() => this.source.refresh())
	);

	_pointMove = (event) => {
		const feature = this.iMap.mapObject.forEachFeatureAtPixel(event.pixel, feature => feature, {
			hitTolerance: 2,
			layerFilter: (layer) => this.vector === layer
		});

		if (feature) {
			this.store.dispatch(new SetMarkUp({
				classToSet: MarkUpClass.hover,
				dataToSet: { overlaysIds: [feature.getId()] }
			}));
		} else if (this.markups.get(MarkUpClass.hover).overlaysIds.some((id) => this.idToEntity.has(id))) {
			this.store.dispatch(new SetMarkUp({ classToSet: MarkUpClass.hover, dataToSet: { overlaysIds: [] } }));
		}

	};

	_dblClick = (event) => {
		const feature = this.iMap.mapObject.forEachFeatureAtPixel(event.pixel, feature => feature, {
			hitTolerance: 2,
			layerFilter: (layer) => this.vector === layer
		});

		if (feature) {
			this.store.dispatch(new DisplayOverlayFromStoreAction({ id: feature.getId() }));
		}
	};

	constructor(public store: Store<any>,
				@Inject(VisualizersConfig) public config: IVisualizersConfig,
				public overlaysService: OverlaysService
	) {
		super();
	}

	getIconSvg(mainColor: string, gradientColor: string = '#c200ae') {
		return 'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0" encoding="UTF-8"?>
					<svg width="98px" height="122px" viewBox="0 0 98 122" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
						<!-- Generator: Sketch 53.2 (72643) - https://sketchapp.com -->
						<title>noun_Cursor_451584 Copy</title>
						<desc>Created with Sketch.</desc>
						<defs>
							<linearGradient x1="50%" y1="100%" x2="50%" y2="-2.91086054%" id="linearGradient-1">
								<stop stop-color="${mainColor}" offset="0%"></stop>
								<stop stop-color="${gradientColor}" offset="100%"></stop>
							</linearGradient>
						</defs>
						<g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-opacity="0.7">
							<g id="cursor-copy" transform="translate(-26.000000, -14.000000)" fill="url(#linearGradient-1)" fill-rule="nonzero" stroke="#25334B" stroke-width="1.5">
								<g id="noun_Cursor_451584-Copy" transform="translate(27.000000, 15.000000)">
									<path d="M9.28808713,120 C10.6862601,120 12.084433,119.623824 13.4826059,118.871473 L47.9126142,100.626959 L82.3426225,118.871473 C83.7407954,119.623824 85.1389683,120 86.5371413,120 C89.6830303,120 92.6541478,118.30721 94.401864,115.485893 C96.1495801,112.664577 96.4991233,109.278997 95.275722,106.081505 L56.651195,6.20689655 C55.2530221,2.44514107 51.9323614,0 47.9126142,0 C43.892867,0 40.7469779,2.44514107 39.1740334,6.20689655 L0.72427796,105.893417 C-0.49912335,109.090909 -0.149580118,112.476489 1.59813604,115.297806 C3.17108058,118.30721 6.14219805,120 9.28808713,120 Z" id="Shape"></path>
								</g>
							</g>
						</g>
					</svg>`);
	}

	calcArrowAngle(previousPoint: [number, number], currentPoint: [number, number]): number {
		const dx = currentPoint[0] - previousPoint[0];
		const dy = currentPoint[1] - previousPoint[1];
		return Math.atan2(dx, dy);
	}

	_colorWithAlpha(color, alpha = 1) {
		const [r, g, b] = Array.from(olColor.asArray(color));
		return olColor.asString([r, g, b, alpha]);
	}

	_lineStringFeatureStyle(feature): any {
		const coordinates = feature.getGeometry().getCoordinates();
		const rotation = this.calcArrowAngle(coordinates[0], coordinates[1]);
		const visualizerStyle = this.config.FootprintPolylineVisualizer;
		const classes = this.markups.findKeysByValue(<string>feature.getId(), 'overlaysIds');

		const isHover = classes.includes(MarkUpClass.hover);
		const isFavorites = classes.includes(MarkUpClass.favorites);
		const isActive = classes.includes(MarkUpClass.active);
		const isDisplayed = classes.includes(MarkUpClass.displayed);

		const {
			active,
			display,
			favorite,
			inactive
		} = visualizerStyle.colors;

		const strokeHoverColor = isFavorites ? favorite : isActive ? active : display;
		const strokeColor = this._colorWithAlpha(strokeHoverColor, 0.5);

		const base = [
			new Style({
				stroke: new Stroke({
					color: strokeColor,
					width: 5
				})
			}),
			new Style({
				image: new Icon({
					src: this.getIconSvg(strokeColor),
					scale: 0.15,
					anchor: [0.5, 0.5],
					rotation,
					rotateWithView: true
				}),
				geometry: new Point(coordinates[0])
			})
		];
		if (isHover) {
			return [
				new Style({
					stroke: new Stroke({
						color: strokeHoverColor,
						width: 7
					})
				}),
				new Style({
					image: new Icon({
						src: this.getIconSvg(strokeHoverColor),
						scale: 0.15,
						anchor: [0.5, 0.5],
						rotation,
						rotateWithView: true
					}),
					geometry: new Point(coordinates[0])
				})
			];
		}

		return base;
	}

	_pointFeatureStyle(feature): any {
		const visualizerStyle = this.config.FootprintPolylineVisualizer;
		const classes = this.markups.findKeysByValue(<string>feature.getId(), 'overlaysIds');
		const isHover = classes.includes(MarkUpClass.hover);
		const isFavorites = classes.includes(MarkUpClass.favorites);
		const isActive = classes.includes(MarkUpClass.active);
		const isDisplayed = classes.includes(MarkUpClass.displayed);

		const {
			active,
			display,
			favorite,
			inactive
		} = visualizerStyle.colors;

		const strokeHoverColor = isFavorites ? favorite : isActive ? active : (isDisplayed || isHover) ? display : inactive;
		const strokeColor = this._colorWithAlpha(strokeHoverColor, 0.8);
		return new Style({
			image: new CircleStyle({
				radius: isHover ? 8 : 7,
				fill: new Fill({ color: isHover ? strokeHoverColor : strokeColor }),
				stroke: new Stroke({ color: display })
			})
		});
	}

	featureStyle(feature, state): any {
		const type = feature.getGeometry().getType();
		switch (type) {
			case 'Point':
				return this._pointFeatureStyle(feature);
			case 'LineString':
				return this._lineStringFeatureStyle(feature);
		}
	}


	onInit() {
		super.onInit();
		this.iMap.mapObject.on('pointermove', this._pointMove);
		this.iMap.mapObject.on('dblclick', this._dblClick);
	}

	onDispose(): void {
		super.onDispose();
		this.iMap.mapObject.un('pointermove', this._pointMove);
		this.iMap.mapObject.un('dblclick', this._dblClick);
	}

}
