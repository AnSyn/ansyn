import { EntitiesVisualizer } from '../entities-visualizer';
import Draw from 'ol/interaction/draw';
import Select from 'ol/interaction/select';
import color from 'ol/color';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import MultiLineString from 'ol/geom/multilinestring';
import GeomPolygon from 'ol/geom/polygon';
import olPolygon from 'ol/geom/polygon';
import condition from 'ol/events/condition';
import { VisualizerInteractions } from '@ansyn/imagery/model/base-imagery-visualizer';
import { cloneDeep } from 'lodash';
import * as ol from 'openlayers';
import { AnnotationMode, AnnotationsContextMenuBoundingRect } from '@ansyn/core/models/visualizers/annotations.model';
import { AnnotationsContextMenuEvent } from '@ansyn/core/index';
import { toDegrees } from '@ansyn/core/utils/math';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { IVisualizerEntity } from '@ansyn/imagery/index';
import { Action, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { AnnotationContextMenuTriggerAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { AnnotationProperties } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Observable } from 'rxjs/Observable';
import { IToolsState, selectSubMenu, SubMenuEnum, toolsFlags, toolsStateSelector } from '@ansyn/menu-items';
import { SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import 'rxjs/add/operator/take';
import { SetAnnotationMode } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import 'rxjs/add/observable/combineLatest';

@Injectable()
export class AnnotationsVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	isHideable = true;
	disableCache = true;

	public mode: AnnotationMode;

	mapState$ = this.store$.select(mapStateSelector);
	layersState$ = this.store$.select(layersStateSelector);
	toolsState$ = this.store$.select(toolsStateSelector);
	/* data */
	annotationsLayer$: Observable<any> = this.layersState$
		.pluck<ILayerState, FeatureCollection<any>>('annotationsLayer')
		.distinctUntilChanged();

	displayAnnotationsLayer$: Observable<any> = this.layersState$
		.pluck<ILayerState, boolean>('displayAnnotationsLayer')
		.distinctUntilChanged();

	annotationFlag$ = this.store$.select(selectSubMenu)
		.map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations)
		.distinctUntilChanged();

	isActiveMap$ = this.mapState$
		.pluck<IMapState, string>('activeMapId')
		.map((activeMapId: string): boolean => activeMapId === this.mapId)
		.distinctUntilChanged();

	annotationMode$: Observable<AnnotationMode> = this.toolsState$
		.pluck<IToolsState, AnnotationMode>('annotationMode')
		.distinctUntilChanged();

	annotationProperties$: Observable<any> = this.store$
		.select(toolsStateSelector)
		.pluck<IToolsState, AnnotationProperties>('annotationProperties');

	/* events */
	annoatationModeChange$: Observable<any> = Observable.combineLatest(this.annotationMode$, this.isActiveMap$)
		.do(this.onModeChange.bind(this));

	annotationPropertiesChange$: Observable<any> = this.annotationProperties$
		.do(this.onAnnotationPropertiesChange.bind(this));

	onAnnotationsChange$ = Observable
		.combineLatest(this.annotationsLayer$, this.annotationFlag$, this.displayAnnotationsLayer$, this.isActiveMap$)
		.mergeMap(this.onAnnotationsChange.bind(this));

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

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	annotationsLayerToEntities(annotationsLayer: FeatureCollection<any>): IVisualizerEntity[] {
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => ({
			id: feature.properties.id,
			featureJson: feature,
			style: feature.properties.style
		}));
	}

	showAnnotation(annotationsLayer): Observable<any> {
		const annotationsLayerEntities = this.annotationsLayerToEntities(annotationsLayer);

		this.getEntities()
			.filter(({ id }) => !annotationsLayerEntities.some((entity) => id === entity.id))
			.forEach(({ id }) => this.removeEntity(id));

		const entities = this.getEntities();

		const entitiesToAdd = annotationsLayerEntities
			.filter((entity) => !entities.some(({ id }) => id === entity.id));

		return this.addOrUpdateEntities(entitiesToAdd);
	}

	onAnnotationPropertiesChange({ fillColor, strokeWidth, strokeColor }: AnnotationProperties) {
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

	onAnnotationsChange([annotationsLayer, annotationFlag, displayAnnotationsLayer, isActiveMap]: [any, boolean, boolean, boolean]): Observable<any> {
		if (displayAnnotationsLayer || (isActiveMap && annotationFlag)) {
			return this.showAnnotation(annotationsLayer);
		}
		this.clearEntities();
		return Observable.of(true);
	}

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.annoatationModeChange$.subscribe(),
			this.annotationPropertiesChange$.subscribe(),
			this.onAnnotationsChange$.subscribe()
		);
	}

	constructor(public store$: Store<any>) {

		super(null, {
			initial: {
				stroke: {
					color: '#27b2cfe6',
					width: 1
				},
				fill: {
					color: `rgba(255, 255, 255, ${AnnotationsVisualizer.fillAlpha})`
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

	protected resetInteractions(): void {
		this.removeInteraction(VisualizerInteractions.contextMenu);
		this.addInteraction(VisualizerInteractions.contextMenu, this.createContextMenuInteraction());
	}

	createContextMenuInteraction() {
		// const condition = (event) => event.originalEvent.which === 3 && event.type === 'pointerdown';
		const contextMenuInteraction = new Select(<any>{
			condition: condition.click,
			layers: [this.vector],
			hitTolerance: 10
		});
		contextMenuInteraction.on('select', this.onSelectFeature.bind(this));

		return contextMenuInteraction;
	}

	onSelectFeature(data) {
		// const originalEventTarget = data.mapBrowserEvent.originalEvent.target;
		data.target.getFeatures().clear();
		const [selectedFeature] = data.selected;
		const boundingRect = this.getFeatureBoundingRect(selectedFeature);
		const { id } = selectedFeature.getProperties();
		const contextMenuEvent: AnnotationsContextMenuEvent = {
			mapId: this.mapId,
			featureId: id,
			boundingRect
		};
		this.store$.dispatch(new SetAnnotationMode());
		this.store$.dispatch(new AnnotationContextMenuTriggerAction(contextMenuEvent));
	}

	changeStrokeColor(color) {
		this.updateStyle({ initial: { stroke: { color } } });
	}

	changeFillColor(fillColor) {
		const [r, g, b] = [...(<any>color).asArray(fillColor)];
		const rgbaColor = (<any>color).asString([r, g, b, AnnotationsVisualizer.fillAlpha]);
		this.updateStyle({ initial: { fill: { color: rgbaColor } } });
	}

	changeStrokeWidth(width) {
		this.updateStyle({ initial: { stroke: { width } } });
	}


	getFeatureBoundingRect(selectedFeature): AnnotationsContextMenuBoundingRect {
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
		this.store$.dispatch(new SetAnnotationMode());
		const geometry = feature.getGeometry();
		let cloneGeometry = <any> geometry.clone();

		if (cloneGeometry instanceof GeomCircle) {
			cloneGeometry = <any> GeomPolygon.fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: `${Date.now()}`,
			style: cloneDeep(this.visualizerStyle)
		});

		this.iMap.projectionService
			.projectCollectionAccurately([feature], this.iMap)
			.take(1)
			.withLatestFrom(this.annotationsLayer$)
			.subscribe(([featureCollection, annotationsLayer]: [FeatureCollection<GeometryObject>, any]) => {
				const [geoJsonFeature] = featureCollection.features;
				const updatedAnnotationsLayer = <FeatureCollection<any>> { ...annotationsLayer };
				updatedAnnotationsLayer.features.push(geoJsonFeature);
				this.store$.dispatch(new SetAnnotationsLayer(updatedAnnotationsLayer));
			});
	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	onModeChange([mode, isActiveMap]: [AnnotationMode, boolean]) {
		this.removeDrawInteraction();

		if (!isActiveMap) {
			this.mode =  undefined;
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
		const geometry = opt_geometry || new olPolygon(null);
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
			const lineStr1 = new LineString([end, [end[0] - factor, end[1] + factor]]);
			const lineStr2 = new LineString([end, [end[0] - factor, end[1] - factor]]);
			lineStr1.rotate(rotation, end);
			lineStr2.rotate(rotation, end);
			geometry.setCoordinates([coordinates, lineStr1.getCoordinates(), lineStr2.getCoordinates()]);
		} else {
			geometry = new MultiLineString([coordinates]);
		}
		return geometry;
	}

	onDispose(): void {
		this.removeDrawInteraction();
	}

}


