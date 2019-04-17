import { EntitiesVisualizer } from '../entities-visualizer';
import Draw from 'ol/interaction/Draw';
import Select from 'ol/interaction/Select';
import * as Sphere from 'ol/sphere';
import olCircle from 'ol/geom/Circle';
import olLineString from 'ol/geom/LineString';
import olMultiLineString from 'ol/geom/MultiLineString';
import olPolygon, { fromCircle } from 'ol/geom/Polygon';
import olFeature from 'ol/Feature';
import olStyle from 'ol/style/Style';
import olFill from 'ol/style/Fill';
import olText from 'ol/style/Text';
import olStroke from 'ol/style/Stroke';

import * as condition from 'ol/events/condition';
import {
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizerStyle,
	MarkerSize,
	VisualizerInteractions,
	VisualizerStates
} from '@ansyn/imagery';
import { cloneDeep, uniq } from 'lodash';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { select, Store } from '@ngrx/store';
import { MapFacadeService, selectActiveMapId, selectMapsList } from '@ansyn/map-facade';
import { combineLatest, Observable } from 'rxjs';
import { Inject } from '@angular/core';
import { distinctUntilChanged, filter, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import OLGeoJSON from 'ol/format/GeoJSON';
import { AutoSubscription } from 'auto-subscriptions';
import { UUID } from 'angular2-uuid';
import { selectGeoFilterSearchMode } from '../../../../../status-bar/reducers/status-bar.reducer';
import { featureCollection } from '@turf/turf';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersProjectionService } from '../../../projection/open-layers-projection.service';
import { ILayer, LayerType } from '../../../../../menu-items/layers-manager/models/layers.model';
import { IToolsConfig, toolsConfig } from '../../../../../menu-items/tools/models/tools-config';
import {
	selectActiveAnnotationLayer,
	selectLayersEntities,
	selectSelectedLayersIds
} from '../../../../../menu-items/layers-manager/reducers/layers.reducer';
import {
	selectAnnotationMode,
	selectAnnotationProperties,
	selectSubMenu,
	SubMenuEnum
} from '../../../../../menu-items/tools/reducers/tools.reducer';
import { AnnotationSelectAction, SetAnnotationMode } from '../../../../../menu-items/tools/actions/tools.actions';
import { UpdateLayer } from '../../../../../menu-items/layers-manager/actions/layers.actions';
import { SearchMode, SearchModeEnum } from '../../../../../status-bar/models/search-mode.enum';
import { ICaseMapState } from '../../../../../menu-items/cases/models/case.model';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import {
	AnnotationInteraction,
	AnnotationMode,
	IAnnotationBoundingRect,
	IAnnotationsSelectionEventData
} from '../../../../../menu-items/tools/models/annotations.model';

// @dynamic
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, toolsConfig],
	isHideable: true
})
export class AnnotationsVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	disableCache = true;
	public mode: AnnotationMode;
	mapSearchIsActive = false;

	protected measuresTextStyle = {
		font: '16px Calibri,sans-serif',
		fill: new olFill({
			color: '#fff'
		}),
		stroke: new olStroke({
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

	annotationFlag$ = this.store$.select(selectSubMenu).pipe(
		map((subMenu: SubMenuEnum) => subMenu === SubMenuEnum.annotations),
		distinctUntilChanged());

	isActiveMap$ = this.store$.select(selectActiveMapId).pipe(
		map((activeMapId: string): boolean => activeMapId === this.mapId),
		distinctUntilChanged()
	);

	annotationMode$: Observable<AnnotationMode> = this.store$.pipe(select(selectAnnotationMode));

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
	annotationPropertiesChange$: Observable<any> = this.store$.pipe(
		select(selectAnnotationProperties),
		tap((changes: Partial<IVisualizerStyle>) => this.updateStyle({ initial: { ...changes } }))
	);

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
				return { feature: currFeature, area: currArea };
			} else {
				return prevResult;
			}
		}, { feature: null, area: Infinity }).feature;
	}

	annotationsLayerToEntities(annotationsLayer: FeatureCollection<any>): IVisualizerEntity[] {
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => ({
			featureJson: feature,
			id: feature.properties.id,
			style: feature.properties.style,
			showMeasures: feature.properties.showMeasures,
			showLabel: feature.properties.showLabel,
			label: feature.properties.label
		}));
	}

	showAnnotation(annotationsLayer): Observable<any> {
		const annotationsLayerEntities = this.annotationsLayerToEntities(annotationsLayer);
		this.getEntities()
			.filter(({ id }) => !annotationsLayerEntities.some((entity) => id === entity.id))
			.forEach(({ id }) => this.removeEntity(id));

		const entitiesToAdd = annotationsLayerEntities
			.filter((entity) => {
				const oldEntity = this.idToEntity.get(entity.id);
				if (oldEntity) {
					const isShowMeasuresDiff = oldEntity.originalEntity.showMeasures !== entity.showMeasures;
					const isLabelDiff = oldEntity.originalEntity.label !== entity.label;
					const isShowLabelDiff = oldEntity.originalEntity.showMeasures !== entity.showMeasures;
					const isFillDiff = oldEntity.originalEntity.style.initial.fill !== entity.style.initial.fill;
					const isStrokeWidthDiff = oldEntity.originalEntity.style.initial['stroke-width'] !== entity.style.initial['stroke-width'];
					const isStrokeDiff = oldEntity.originalEntity.style.initial['stroke'] !== entity.style.initial['stroke'];
					const isOpacityDiff = ['fill-opacity', 'stroke-opacity'].filter((o) => oldEntity.originalEntity.style.initial[o] !== entity.style.initial[o]);
					return isShowMeasuresDiff || isLabelDiff || isShowLabelDiff || isFillDiff || isStrokeWidthDiff || isStrokeDiff || isOpacityDiff;
				}
				return true;
			});
		return this.addOrUpdateEntities(entitiesToAdd);
	}

	onAnnotationsChange([entities, annotationFlag, selectedLayersIds, isActiveMap, activeAnnotationLayer]: [{ [key: string]: ILayer }, boolean, string[], boolean, string]): Observable<any> {

		const displayedIds = uniq(
			isActiveMap && annotationFlag ? [...selectedLayersIds, activeAnnotationLayer] : [...selectedLayersIds]
		)
			.filter((id: string) => entities[id] && entities[id].type === LayerType.annotation);

		const features = displayedIds.reduce((array, layerId) => [...array, ...entities[layerId].data.features], []);
		return this.showAnnotation(featureCollection(features));
	}

	constructor(public store$: Store<any>, protected projectionService: OpenLayersProjectionService, @Inject(toolsConfig) toolsConfig: IToolsConfig) {

		super(null, {
			initial: {
				stroke: '#27b2cfe6',
				'stroke-width': 1,
				fill: `white`,
				'fill-opacity': AnnotationsVisualizer.fillAlpha,
				'marker-size': MarkerSize.medium,
				'marker-color': `#ffffff`,
				label: {
					overflow: true,
					font: '27px Calibri,sans-serif',
					stroke: '#000',
					fill: 'white',
					offsetY: (feature: olFeature) => {
						const { mode } = feature.getProperties();
						return mode === 'Point' ? 30 : 0;
					},
					text: (feature: olFeature) => {
						const properties = feature.getProperties();
						const { showLabel, label } = properties;
						return showLabel ? label : '';
					}
				}
			}
		});

		//  0 or 1
		if (Number(toolsConfig.Annotations.displayId)) {
			this.updateStyle({
				initial: {
					label: {
						font: '12px Calibri,sans-serif',
						fill: '#fff',
						'stroke-width': 3,
						text: (feature) => feature.getId() || ''
					}
				}
			});
		}
	}

	resetInteractions(): void {
		this.store$.dispatch(new SetAnnotationMode());
		this.removeInteraction(VisualizerInteractions.click);
		this.addInteraction(VisualizerInteractions.click, this.createClickInteraction());
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.addInteraction(VisualizerInteractions.pointerMove, this.createHoverInteraction());
	}

	createClickInteraction() {
		const interaction = new Select(<any>{
			condition: condition.click,
			...this.interactionParams
		});
		interaction.on('select', this.onClickAnnotation.bind(this));
		return interaction;
	}

	onClickAnnotation(event) {
		this.clearCurrentHoverSelection();
		event.target.getFeatures().clear();
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const selectedFeature = AnnotationsVisualizer.findFeatureWithMinimumArea(event.selected);
		const boundingRect = this.getFeatureBoundingRect(selectedFeature);
		const { id, showMeasures, label, showLabel, style } = this.getEntity(selectedFeature);
		const eventData: IAnnotationsSelectionEventData = {
			label: label,
			mapId: this.mapId,
			style: style,
			featureId: id,
			boundingRect,
			type: selectedFeature ? selectedFeature.values_.mode : undefined,
			interactionType: AnnotationInteraction.click,
			showMeasures,
			showLabel
		};
		this.store$.dispatch(new AnnotationSelectAction(eventData));
	}

	clearCurrentHoverSelection() {
		const hoverInteraction = this.getInteraction(VisualizerInteractions.pointerMove);
		hoverInteraction.getFeatures().clear();
		this.onHoverInteraction(hoverInteraction);
	}

	createHoverInteraction() {
		const annotationHoverInteraction = new Select(<any>{
			condition: condition.pointerMove,
			...this.interactionParams
		});
		annotationHoverInteraction.on('select', this.onHoverAnnotation.bind(this));
		return annotationHoverInteraction;
	}

	onHoverAnnotation(event) {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		return this.onHoverInteraction(event.target);
	}

	onHoverInteraction(interaction) {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		let selectedFeature, boundingRect, id, label, showLabel, style;
		let selected = interaction.getFeatures().getArray();
		if (selected.length > 0) {
			selectedFeature = AnnotationsVisualizer.findFeatureWithMinimumArea(selected);
			boundingRect = this.getFeatureBoundingRect(selectedFeature);
			id = this.getEntity(selectedFeature).id;
			label = this.getEntity(selectedFeature).label;
			showLabel = this.getEntity(selectedFeature).showLabel;
			style = this.getEntity(selectedFeature).style;
		}
		const eventData: IAnnotationsSelectionEventData = {
			label: label,
			mapId: this.mapId,
			featureId: id,
			style: style,
			boundingRect,
			type: selectedFeature ? selectedFeature.values_.mode : undefined,
			interactionType: AnnotationInteraction.hover,
			showLabel: showLabel
		};
		this.store$.dispatch(new AnnotationSelectAction(eventData));
	}

	getFeatureBoundingRect(selectedFeature): IAnnotationBoundingRect {
		const { geometry }: any = new OLGeoJSON().writeFeatureObject(selectedFeature);
		const { maxX, maxY, minX, minY } = this.findMinMax(geometry.coordinates);
		const width = maxX - minX;
		const left = minX;
		const height = maxY - minY;
		const top = maxY - height;
		return { left, top, width, height };
	}

	private isNumArray([first, second]) {
		return typeof first === 'number' && typeof second === 'number';
	}

	private findMinMaxHelper(array, prev = { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }) {
		const [x, y] = this.iMap.mapObject.getPixelFromCoordinate(array);
		return {
			maxX: Math.max(x, prev.maxX),
			maxY: Math.max(y, prev.maxY),
			minX: Math.min(x, prev.minX),
			minY: Math.min(y, prev.minY)
		};
	}

	findMinMax(array) {
		if (this.isNumArray(array)) {
			return this.findMinMaxHelper(array);
		}
		return array.reduce((prev = { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }, item) => {
			if (this.isNumArray(item)) {
				return this.findMinMaxHelper(item, prev);
			}
			const { maxX, maxY, minX, minY } = this.findMinMax(item);
			return {
				maxX: Math.max(maxX, prev.maxX),
				maxY: Math.max(maxY, prev.maxY),
				minX: Math.min(minX, prev.minX),
				minY: Math.min(minY, prev.minY)
			};

		}, undefined);
	}

	onDrawEndEvent({ feature }) {
		const { mode } = this;

		this.store$.dispatch(new SetAnnotationMode());
		const geometry = feature.getGeometry();
		let cloneGeometry = <any>geometry.clone();

		if (cloneGeometry instanceof olCircle) {
			cloneGeometry = <any>fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: UUID.UUID(),
			style: cloneDeep(this.visualizerStyle),
			showMeasures: false,
			showLabel: false,
			label: '',
			mode
		});

		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject)
			.pipe(
				take(1),
				withLatestFrom(this.activeAnnotationLayer$, this.currentOverlay$),
				tap(([featureCollection, activeAnnotationLayer, overlay]: [FeatureCollection<GeometryObject>, ILayer, IOverlay]) => {
					const [geoJsonFeature] = featureCollection.features;
					const data = <FeatureCollection<any>>{ ...activeAnnotationLayer.data };
					data.features.push(geoJsonFeature);
					if (overlay) {
						geoJsonFeature.properties = {
							...geoJsonFeature.properties,
							...this.projectionService.getProjectionProperties(this.communicator, data, feature, overlay)
						};
					}
					geoJsonFeature.properties = { ...geoJsonFeature.properties };
					this.store$.dispatch(new UpdateLayer(<ILayer>{ ...activeAnnotationLayer, data }));
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
			condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
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
		const geometry = opt_geometry || new olPolygon([]);
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
			const lineStr1 = new olLineString([end, [end[0] - factor, end[1] + factor]]);
			const lineStr2 = new olLineString([end, [end[0] - factor, end[1] - factor]]);
			lineStr1.rotate(rotation, end);
			lineStr2.rotate(rotation, end);
			geometry.setCoordinates([coordinates, lineStr1.getCoordinates(), lineStr2.getCoordinates()]);
		} else {
			geometry = new olMultiLineString([coordinates]);
		}
		return geometry;
	}

	onDispose(): void {
		super.onDispose();
		this.removeDrawInteraction();
	}

	featureStyle(feature: olFeature, state: string = VisualizerStates.INITIAL) {
		const style: olStyle = super.featureStyle(feature, state);
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			return [style, ...this.getMeasuresAsStyles(feature)];
		} else {
			return style;
		}
	}

	getMeasuresAsStyles(feature: olFeature): olStyle[] {
		const { mode } = feature.getProperties();
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();
		const moreStyles: olStyle[] = [];
		let coordinates: any[] = [];
		switch (mode) {
			case 'LineString': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates();
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
			}
				break;
			case 'Polygon':
			case 'Arrow':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < coordinates.length - 1; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
				break;
			case 'Rectangle': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < 2; i++) {
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				}
			}
				break;
			case 'Circle':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				const leftright = coordinates.reduce((prevResult, currCoord) => {
					if (currCoord[0] > prevResult.right[0]) {
						return { left: prevResult.left, right: currCoord };
					} else if (currCoord[0] < prevResult.left[0]) {
						return { left: currCoord, right: prevResult.right };
					} else {
						return prevResult;
					}
				}, { left: [Infinity, 0], right: [-Infinity, 0] });
				const line: olLineString = new olLineString([leftright.left, leftright.right]);
				moreStyles.push(
					new olStyle({
						geometry: line,
						stroke: new olStroke({
							color: '#27b2cfe6',
							width: 1
						}),
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(Sphere.getLength(line, { projection }))
						})
					}));
				break;
		}
		moreStyles.push(...this.areaCircumferenceStyles(feature, projection));
		return moreStyles;
	}

	formatArea(calcArea: number): string {
		return Math.round(calcArea * 100) / 100 + ' Km²';
	};

	formatLength(calcLength): string {
		let output;
		if (calcLength >= 1000) {
			output = (Math.round(calcLength / 1000 * 100) / 100) + ' Km';
		} else {
			output = (Math.round(calcLength * 100) / 100) + ' m';
		}
		return output;
	};

	areaCircumferenceStyles(feature: any, projection: any): olStyle[] {

		const calcCircumference = Sphere.getLength(feature.getGeometry(), { projection });
		const calcArea = Sphere.getArea(feature.getGeometry(), { projection });
		const { height } = this.getFeatureBoundingRect(feature);
		if (!calcArea || !calcCircumference) {
			return [];
		}
		return [
			new olStyle({
				text: new olText({
					...this.measuresTextStyle,
					text: `Circumference: ${this.formatLength(calcCircumference)}`,
					offsetY: -height / 2 - 44
				})
			}),
			new olStyle({
				text: new olText({
					...this.measuresTextStyle,
					text: `Area: ${this.formatArea(calcArea / 1000000)}`,
					offsetY: -height / 2 - 25
				})
			})
		];
	}

}


