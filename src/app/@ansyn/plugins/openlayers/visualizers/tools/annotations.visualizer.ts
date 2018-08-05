import { EntitiesVisualizer } from '../entities-visualizer';
import Draw from 'ol/interaction/draw';
import Select from 'ol/interaction/select';
import Sphere from 'ol/sphere';
import OlCircle from 'ol/geom/circle';
import OlLineString from 'ol/geom/linestring';
import OlMultiLineString from 'ol/geom/multilinestring';
import OlPolygon from 'ol/geom/polygon';
import OlFeature from 'ol/feature';
import OlStyle from 'ol/style/style';
import OlFill from 'ol/style/fill';
import OlText from 'ol/style/text';
import OlStroke from 'ol/style/stroke';

import condition from 'ol/events/condition';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import { cloneDeep, uniq } from 'lodash';
import * as ol from 'openlayers';
import {
	AnnotationInteraction,
	AnnotationMode,
	IAnnotationsContextMenuBoundingRect,
	IAnnotationsContextMenuEvent
} from '@ansyn/core/models/visualizers/annotations.model';
import { toDegrees } from '@ansyn/core/utils/math';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { select, Store } from '@ngrx/store';
import { AnnotationContextMenuTriggerAction } from '@ansyn/map-facade/actions/map.actions';
import {
	IAnnotationProperties,
	selectAnnotationMode,
	selectAnnotationProperties,
	selectSubMenu,
	SubMenuEnum
} from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { combineLatest, Observable } from 'rxjs';
import {
	selectActiveAnnotationLayer,
	selectLayersEntities,
	selectSelectedLayersIds
} from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import 'rxjs/add/operator/take';
import { SetAnnotationMode } from '@ansyn/menu-items/tools/actions/tools.actions';
import { selectActiveMapId, selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import 'rxjs/add/observable/combineLatest';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { ImageryVisualizer } from '@ansyn/imagery/decorators/imagery-visualizer';
import { IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { Inject } from '@angular/core';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { filter, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import OLGeoJSON from 'ol/format/geojson';
import { MarkerSize } from '@ansyn/core/models/visualizers/visualizer-style';
import { AutoSubscription } from 'auto-subscriptions';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { UpdateLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { UUID } from 'angular2-uuid';
import { Dictionary } from '@ngrx/entity/src/models';
import { selectGeoFilterSearchMode } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { SearchMode, SearchModeEnum } from '@ansyn/status-bar/models/search-mode.enum';
import { featureCollection } from '@turf/turf';
import { VisualizerStates } from '@ansyn/core/models/visualizers/visualizer-state';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, ProjectionService, toolsConfig],
	isHideable: true
})
export class AnnotationsVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	disableCache = true;
	public mode: AnnotationMode;
	mapSearchIsActive = false;

	protected measuresTextStyle = {
		font: '16px Calibri,sans-serif',
		fill: new OlFill({
			color: '#fff'
		}),
		stroke: new OlStroke({
			color: '#000',
			width: 3
		}),
		offsetY: 30
	};

	activeAnnotationLayer$: Observable<ILayer> = this.store$
		.pipe(
			select(selectActiveAnnotationLayer),
			withLatestFrom(this.store$.select(selectLayersEntities)),
			map(([activeAnnotationLayerId, entities]) => entities[activeAnnotationLayerId])
		);

	currentOverlay$ = this.store$.pipe(
		select(selectMapsList),
		map((mapList) => MapFacadeService.mapById(mapList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.data.overlay)
	);

	annotationFlag$ = this.store$.select(selectSubMenu)
		.map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations)
		.distinctUntilChanged();

	isActiveMap$ = this.store$.select(selectActiveMapId)
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();

	annotationMode$: Observable<AnnotationMode> = this.store$.pipe(select(selectAnnotationMode));
	annotationProperties$: Observable<any> = this.store$.pipe(select(selectAnnotationProperties));

	@AutoSubscription
	geoFilterSearchMode$ = this.store$.pipe(
		select(selectGeoFilterSearchMode),
		tap((searchMode: SearchMode) => {
			this.mapSearchIsActive = searchMode !== SearchModeEnum.none;
		})
	);

	@AutoSubscription
	annoatationModeChange$: Observable<any> = combineLatest(this.annotationMode$, this.isActiveMap$)
		.pipe(
			tap(this.onModeChange.bind(this))
		);

	@AutoSubscription
	annotationPropertiesChange$: Observable<any> = this.annotationProperties$
		.do(this.onAnnotationPropertiesChange.bind(this));

	@AutoSubscription
	onAnnotationsChange$ = combineLatest(
		this.store$.pipe(select(selectLayersEntities)),
		this.annotationFlag$,
		this.store$.select(selectSelectedLayersIds),
		this.isActiveMap$,
		this.store$.select(selectActiveAnnotationLayer)
	).pipe(
		mergeMap(this.onAnnotationsChange.bind(this))
	);

	modeDictionary = {
		Arrow: {
			type: 'LineString',
			geometryFunction: this.arrowGeometryFunction.bind(this)
		},
		Rectangle: {
			type: 'Circle',
			geometryFunction: this.rectangleGeometryFunction.bind(this)
		}
	};

	get mapRotation(): number {
		return this.iMap.mapObject.getView().getRotation();
	}

	get interactionParams() {
		return {
			layers: [this.vector],
			hitTolerance: 0,
			style: (feature) => this.featureStyle(feature),
			multi: true
		};
	}

	static findFeatureWithMinimumArea(featuresArray: any[]) {
		return featuresArray.reduce((prevResult, currFeature) => {
			const currGeometry = currFeature.getGeometry();
			const currArea = currGeometry.getArea ? currGeometry.getArea() : 0;
			if (currArea < prevResult.area) {
				return { feature: currFeature, area: currArea }
			} else {
				return prevResult;
			}
		}, { feature: null, area: Infinity }).feature;
	}

	annotationsLayerToEntities(annotationsLayer: FeatureCollection<any>): IVisualizerEntity[] {
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => ({
			id: feature.properties.id,
			featureJson: feature,
			style: feature.properties.style,
			showMeasures: feature.properties.showMeasures
		}));
	}

	showAnnotation(annotationsLayer): Observable<any> {
		const annotationsLayerEntities = this.annotationsLayerToEntities(annotationsLayer);

		this.getEntities()
			.filter(({ id }) => !annotationsLayerEntities.some((entity) => id === entity.id))
			.forEach(({ id }) => this.removeEntity(id));

		// const entities = this.getEntities();

		const entitiesToAdd = annotationsLayerEntities
			.filter((entity) => {
				const oldEntity = this.idToEntity.get(entity.id);
				return !oldEntity || oldEntity.originalEntity.showMeasures !== entity.showMeasures;
			});

		return this.addOrUpdateEntities(entitiesToAdd);
	}

	onAnnotationPropertiesChange({ fillColor, strokeWidth, strokeColor }: IAnnotationProperties) {
		if (fillColor) {
			this.changeFillColor(fillColor);
		}
		if (strokeWidth) {
			this.changeStrokeWidth(strokeWidth);
		}
		if (strokeColor) {
			this.changeStrokeColor(strokeColor);
		}
	}

	onAnnotationsChange([entities, annotationFlag, selectedLayersIds, isActiveMap, activeAnnotationLayer]: [Dictionary<ILayer>, boolean, string[], boolean, string]): Observable<any> {
		const displayedIds = uniq(
			isActiveMap && annotationFlag ? [...selectedLayersIds, activeAnnotationLayer] : [...selectedLayersIds]
		)
			.filter((id: string) => entities[id] && entities[id].type === LayerType.annotation);

		const features = displayedIds.reduce((array, layerId) => [...array, ...entities[layerId].data.features], []);
		return this.showAnnotation(featureCollection(features));
	}

	constructor(public store$: Store<any>, protected projectionService: ProjectionService, @Inject(toolsConfig) toolsConfig: IToolsConfig) {

		super(null, {
			initial: {
				stroke: '#27b2cfe6',
				'stroke-width': 1,
				fill: `white`,
				'fill-opacity': AnnotationsVisualizer.fillAlpha,
				'marker-size': MarkerSize.medium,
				'marker-color': `white`
			}
		});

		//  0 or 1
		if (Number(toolsConfig.Annotations.displayId)) {
			this.updateStyle({
				initial: {
					label: {
						font: '12px Calibri,sans-serif',
						fill: '#fff',
						stroke: '#000',
						'stroke-width': 3,
						text: (feature) => feature.getId() || ''
					}
				}
			});
		}
	}

	resetInteractions(): void {
		this.store$.dispatch(new SetAnnotationMode());
		this.removeInteraction(VisualizerInteractions.contextMenu);
		this.addInteraction(VisualizerInteractions.contextMenu, this.createContextMenuInteraction());
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.addInteraction(VisualizerInteractions.pointerMove, this.createAnnotationHoverInteraction());
	}

	createContextMenuInteraction() {
		const contextMenuInteraction = new Select(<any>{
			condition: condition.click,
			...this.interactionParams
		});
		contextMenuInteraction.on('select', this.onSelectFeature.bind(this));
		return contextMenuInteraction;
	}

	onSelectFeature(data) {
		data.target.getFeatures().clear();
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const selectedFeature = AnnotationsVisualizer.findFeatureWithMinimumArea(data.selected);
		const boundingRect = this.getFeatureBoundingRect(selectedFeature);
		const { id, showMeasures } = selectedFeature.getProperties();
		const contextMenuEvent: IAnnotationsContextMenuEvent = {
			mapId: this.mapId,
			featureId: id,
			boundingRect,
			interactionType: AnnotationInteraction.click,
			showMeasures
		};
		this.store$.dispatch(new AnnotationContextMenuTriggerAction(contextMenuEvent));
	}

	createAnnotationHoverInteraction() {
		const annotationHoverInteraction = new Select(<any>{
			condition: condition.pointerMove,
			...this.interactionParams
		});
		annotationHoverInteraction.on('select', this.onHoverFeature.bind(this));
		return annotationHoverInteraction;
	}

	onHoverFeature(data) {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		let selectedFeature, boundingRect, id;
		let selected = data.target.getFeatures().getArray();
		if (selected.length > 0) {
			selectedFeature = AnnotationsVisualizer.findFeatureWithMinimumArea(selected);
			boundingRect = this.getFeatureBoundingRect(selectedFeature);
			id = selectedFeature.getProperties().id;
		}
		const contextMenuEvent: IAnnotationsContextMenuEvent = {
			mapId: this.mapId,
			featureId: id,
			boundingRect,
			interactionType: AnnotationInteraction.hover
		};
		this.store$.dispatch(new AnnotationContextMenuTriggerAction(contextMenuEvent));
	}

	changeStrokeColor(color) {
		this.updateStyle({ initial: { stroke: color } });
	}

	changeFillColor(fillColor) {
		this.updateStyle({ initial: { fill: fillColor, 'marker-color': fillColor } });
	}

	changeStrokeWidth(width) {
		this.updateStyle({ initial: { 'stroke-width': width } });
	}


	getFeatureBoundingRect(selectedFeature): IAnnotationsContextMenuBoundingRect {
		const rotation = toDegrees(this.mapRotation);
		const extent = selectedFeature.getGeometry().getExtent();
		// [bottomLeft, bottomRight, topRight, topLeft]
		const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = this.getExtentAsPixels(extent);
		const width = Math.sqrt(Math.pow(x4 - x3, 2) + Math.pow(y3 - y4, 2));
		const height = Math.sqrt(Math.pow(y4 - y1, 2) + Math.pow(x4 - x1, 2));
		return { left: x4, top: y4, width, height, rotation };
	}

	getExtentAsPixels([x1, y1, x2, y2]) {
		const bottomLeft = this.iMap.mapObject.getPixelFromCoordinate([x1, y1]);
		const bottomRight = this.iMap.mapObject.getPixelFromCoordinate([x2, y1]);
		const topRight = this.iMap.mapObject.getPixelFromCoordinate([x2, y2]);
		const topLeft = this.iMap.mapObject.getPixelFromCoordinate([x1, y2]);
		return [bottomLeft, bottomRight, topRight, topLeft];
	}

	onDrawEndEvent({ feature }) {
		const { mode } = this;

		this.store$.dispatch(new SetAnnotationMode());
		const geometry = feature.getGeometry();
		let cloneGeometry = <any> geometry.clone();

		if (cloneGeometry instanceof OlCircle) {
			cloneGeometry = <any> OlPolygon.fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: UUID.UUID(),
			style: cloneDeep(this.visualizerStyle),
			showMeasures: false,
			mode
		});

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.pipe(
				take(1),
				withLatestFrom(this.activeAnnotationLayer$, this.currentOverlay$),
				tap(([featureCollection, activeAnnotationLayer, overlay]: [FeatureCollection<GeometryObject>, ILayer, IOverlay]) => {
					const [geoJsonFeature] = featureCollection.features;
					const data = <FeatureCollection<any>> { ...activeAnnotationLayer.data };
					data.features.push(geoJsonFeature);
					if (overlay) {
						geoJsonFeature.properties = {
							...geoJsonFeature.properties,
							overlayId: overlay.id,
							pixels: new OLGeoJSON().writeFeatureObject(feature),
							...this.projectionService.getProjectionProperties(this.communicator, data)
						};
					}
					geoJsonFeature.properties = { ...geoJsonFeature.properties };
					this.store$.dispatch(new UpdateLayer({ ...activeAnnotationLayer, data }));
				})
			).subscribe();

	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	onModeChange([mode, isActiveMap]: [AnnotationMode, boolean]) {
		this.removeDrawInteraction();

		if (!isActiveMap) {
			this.mode = undefined;
			return;
		}

		this.mode = mode === this.mode ? undefined : mode;

		if (!this.mode) {
			return;
		}

		const drawInteractionHandler = new Draw({
			type: this.modeDictionary[mode] ? this.modeDictionary[mode].type : mode,
			geometryFunction: this.modeDictionary[mode] ? this.modeDictionary[mode].geometryFunction : undefined,
			condition: (event: ol.MapBrowserEvent) => (<MouseEvent>event.originalEvent).which === 1,
			style: this.featureStyle.bind(this)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	rectangleGeometryFunction([topLeft, bottomRight], opt_geometry) {
		const [x1, y1] = this.iMap.mapObject.getPixelFromCoordinate(topLeft);
		const [x2, y2] = this.iMap.mapObject.getPixelFromCoordinate(bottomRight);
		const topRight = this.iMap.mapObject.getCoordinateFromPixel([x2, y1]);
		const bottomLeft = this.iMap.mapObject.getCoordinateFromPixel([x1, y2]);
		const geometry = opt_geometry || new OlPolygon(null);
		const boundingBox = [topLeft, topRight, bottomRight, bottomLeft, topLeft];
		geometry.setCoordinates([boundingBox]);
		return geometry;
	}

	arrowGeometryFunction(coordinates, opt_geometry) {
		let geometry = opt_geometry;
		if (opt_geometry) {
			// two lines to draw arrow
			const start = coordinates[coordinates.length - 2];
			const end = coordinates[coordinates.length - 1];
			const dx = end[0] - start[0];
			const dy = end[1] - start[1];
			const rotation = Math.atan2(dy, dx);
			const lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			const factor = lineLength * 0.1;
			const lineStr1 = new OlLineString([end, [end[0] - factor, end[1] + factor]]);
			const lineStr2 = new OlLineString([end, [end[0] - factor, end[1] - factor]]);
			lineStr1.rotate(rotation, end);
			lineStr2.rotate(rotation, end);
			geometry.setCoordinates([coordinates, lineStr1.getCoordinates(), lineStr2.getCoordinates()]);
		} else {
			geometry = new OlMultiLineString([coordinates]);
		}
		return geometry;
	}

	onDispose(): void {
		super.onDispose();
		this.removeDrawInteraction();
	}

	featureStyle(feature: OlFeature, state: string = VisualizerStates.INITIAL) {
		const style: OlStyle = super.featureStyle(feature, state);
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			return [style, ...this.getMeasuresAsStyles(feature)]
		} else {
			return style;
		}
	}

	getMeasuresAsStyles(feature: OlFeature): OlStyle[] {
		const { mode } = feature.getProperties();
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();
		let coordinates: any[] = [];
		let moreStyles: OlStyle[] = [];
		switch (mode) {
			case 'LineString':
				coordinates = (<OlLineString>feature.getGeometry()).getCoordinates();
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: OlLineString = new OlLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new OlStyle({
						geometry: line,
						text: new OlText({
							...this.measuresTextStyle,
							text: this.formatLength(line, projection)
						})
					}));
				}
				break;
			case 'Polygon':
				coordinates = (<OlLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: OlLineString = new OlLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new OlStyle({
						geometry: line,
						text: new OlText({
							...this.measuresTextStyle,
							text: this.formatLength(line, projection)
						})
					}));
				}
				break;
			case 'Rectangle':
				coordinates = (<OlLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < 2; i++) {
					const line: OlLineString = new OlLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new OlStyle({
						geometry: line,
						text: new OlText({
							...this.measuresTextStyle,
							text: this.formatLength(line, projection)
						})
					}));
				}
				break;
			case 'Circle':
				coordinates = (<OlLineString>feature.getGeometry()).getCoordinates()[0];
				const leftright = coordinates.reduce((prevResult, currCoord) => {
					if (currCoord[0] > prevResult.right[0]) {
						return { left: prevResult.left, right: currCoord };
					} else if (currCoord[0] < prevResult.left[0]) {
							return {left: currCoord, right: prevResult.right};
					} else {
						return prevResult;
					}
				}, {left: [Infinity, 0], right: [-Infinity, 0]});
				console.log('circle', feature, coordinates, leftright);
				const line: OlLineString = new OlLineString([leftright.left, leftright.right]);
				moreStyles.push(new OlStyle({
					geometry: line,
					stroke: new OlStroke({
						color: '#27b2cfe6',
						width: 1
					}),
					text: new OlText({
						...this.measuresTextStyle,
						text: this.formatLength(line, projection)
					})
				}));
				break;
		}
		return moreStyles
	}

	/**
	 * Format length output.
	 * @param line The line.
	 * @param projection The Projection.
	 */
	formatLength(line, projection): string {
		const length = Sphere.getLength(line, { projection: projection });
		let output;
		if (length >= 1000) {
			output = (Math.round(length / 1000 * 100) / 100) +
				' ' + 'km';
		} else {
			output = (Math.round(length * 100) / 100) +
				' ' + 'm';
		}
		return output;
	};

}


