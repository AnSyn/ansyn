import { Inject } from '@angular/core';
import {
	ImageryVisualizer,
	IVisualizerEntity,
	MarkerSize,
	VisualizerInteractions,
	VisualizerStates
} from '@ansyn/imagery';
import { UUID } from 'angular2-uuid';
import { AutoSubscription } from 'auto-subscriptions';
import { Feature, FeatureCollection, GeometryObject } from 'geojson';
import { cloneDeep, merge } from 'lodash';
import { platformModifierKeyOnly } from 'ol/events/condition';
import olFeature from 'ol/Feature';
import olCollection from 'ol/Collection';
import OLGeoJSON from 'ol/format/GeoJSON';
import olCircle from 'ol/geom/Circle';
import olLineString from 'ol/geom/LineString';
import olMultiLineString from 'ol/geom/MultiLineString';
import olPoint from 'ol/geom/Point';
import olPolygon, { fromCircle } from 'ol/geom/Polygon';
import DragBox from 'ol/interaction/DragBox';
import olTranslate from 'ol/interaction/Translate';
import olModify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import olFill from 'ol/style/Fill';
import olIcon from 'ol/style/Icon';
import olStroke from 'ol/style/Stroke';
import olStyle from 'ol/style/Style';
import olText from 'ol/style/Text';
import { Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';
import { EntitiesVisualizer } from '../entities-visualizer';
import { IOLPluginsConfig, OL_PLUGINS_CONFIG } from '../plugins.config';
import { AnnotationMode, IAnnotationBoundingRect, IDrawEndEvent } from './annotations.model';
import { DragPixelsInteraction } from './dragPixelsInteraction';
import { TranslateService } from '@ngx-translate/core';

export interface ILabelTranslateMode {
	originalFeature: olFeature,
	labelFeature: olFeature
}

export interface IEditAnnotationMode {
	originalFeature: olFeature,
	centerFeature: olFeature,
}


// @dynamic
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [OpenLayersProjectionService, OL_PLUGINS_CONFIG, TranslateService],
	isHideable: true
})
export class AnnotationsVisualizer extends EntitiesVisualizer {
	static fillAlpha = 0.4;
	disableCache = true;
	public mode: AnnotationMode;
	mapSearchIsActive = false;
	selected: string[] = [];
	geoJsonFormat: OLGeoJSON;
	dragBox = new DragBox({ condition: platformModifierKeyOnly });
	translationSubscriptions = [];
	currentAnnotationEdit: IEditAnnotationMode;
	labelTranslate: ILabelTranslateMode;
	events = {
		onClick: new Subject(),
		onSelect: new Subject<string[]>(),
		onHover: new Subject<string>(),
		onChangeMode: new Subject<{ mode: AnnotationMode, forceBroadcast: boolean }>(),
		onDrawEnd: new Subject<IDrawEndEvent>(),
		removeEntity: new Subject<string>(),
		updateEntity: new Subject<IVisualizerEntity>(),
		offsetEntity: new Subject<any>(),
		onLabelTranslateStart: new Subject<ILabelTranslateMode>(),
		onLabelTranslateEnd: new Subject(),
		onAnnotationEditEnd: new Subject<IDrawEndEvent>(),
		onAnnotationEditStart: new Subject<IEditAnnotationMode>()
	};
	clearLabelTranslate$: any = tap(() => {
		if (this.labelTranslate) {
			this.labelTranslateMode(this.labelTranslate.originalFeature.getId())
		}
	});
	clearAnnotationEditMode$ = tap(() => {
		this.clearAnnotationEditMode();
	});

	@AutoSubscription
	selected$ = this.events.onSelect.pipe(
		this.clearAnnotationEditMode$,
		this.clearLabelTranslate$,
		tap((selected: any) => this.selected = selected));

	@AutoSubscription
	labelTranslate$ = this.events.onLabelTranslateStart.pipe(tap((labelTranslate) => this.labelTranslate = labelTranslate));

	@AutoSubscription
	editAnnotation$ = this.events.onAnnotationEditStart.pipe(tap(annotationEdit => this.currentAnnotationEdit = annotationEdit));

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

	protected measuresTextStyle = {
		font: '16px Calibri,sans-serif',
		fill: new olFill({
			color: '#fff'
		}),
		stroke: new olStroke({
			color: '#000',
			width: 3
		}),
		placement: 'line',
		overflow: true,
		rotateWithView: true
	};

	private iconSrc = '';

	constructor(protected projectionService: OpenLayersProjectionService,
				@Inject(OL_PLUGINS_CONFIG) protected olPluginsConfig: IOLPluginsConfig,
				protected translator: TranslateService) {

		super(null, {
			initial: {
				stroke: '#27b2cfe6',
				'stroke-width': 1,
				fill: `white`,
				'fill-opacity': AnnotationsVisualizer.fillAlpha,
				'stroke-opacity': 1,
				'marker-size': MarkerSize.medium,
				'marker-color': `#ffffff`,
				label: {
					overflow: true,
					fontSize: (feature) => {
						const entity = this.idToEntity.get(feature.getId());
						const labelSize = entity && entity.originalEntity && entity.originalEntity.labelSize;
						return labelSize || 28;
					},
					stroke: '#000',
					fill: 'white',
					offsetY: 30,
					text: (feature: olFeature) => {
						const entity = this.idToEntity.get(feature.getId());
						if (entity) {
							const { label } = entity.originalEntity;
							return label.text || '';
						}
						return '';
					}
				}
			}
		});

		//  0 or 1
		if (Number(olPluginsConfig.Annotations.displayId)) {
			this.updateStyle({
				initial: {
					label: {
						fontSize: 12,
						fill: '#fff',
						'stroke-width': 3,
						text: (feature) => feature.getId() || ''
					}
				}
			});
		}
		this.geoJsonFormat = new OLGeoJSON();
	}

	findFeatureWithMinimumArea(featuresArray: any[]) {
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
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => {
			const featureJson = { ...feature };
			delete featureJson.properties.featureJson;
			return {
				featureJson,
				id: feature.properties.id,
				style: feature.properties.style || this.visualizerStyle,
				showMeasures: feature.properties.showMeasures || false,
				showArea: feature.properties.showArea || false,
				label: feature.properties.label || { text: '', geometry: null },
				icon: feature.properties.icon || '',
				undeletable: feature.properties.undeletable || false,
				labelSize: feature.properties.labelSize || 28,
				labelTranslateOn: feature.properties.labelTranslateOn || false
			};
		});
	}

	setMode(mode, forceBroadcast: boolean) {
		if (this.mode !== mode) {
			this.mode = mode;
			this.removeInteractions();

			if (this.mode === AnnotationMode.Translate) {
				const traslationInteractionHandler = new DragPixelsInteraction();
				this.translationSubscriptions.push(
					traslationInteractionHandler.onDrag.subscribe((pixel: [number, number]) => {
						if (Boolean(this.source)) {
							const features: [] = this.source.getFeatures();
							features.forEach((feature: any) => {
								const geometry = feature.getGeometry();
								geometry.translate(pixel[0], pixel[1]);
							});
							this.offset[0] = this.offset[0] + pixel[0];
							this.offset[1] = this.offset[1] + pixel[1];
						}
					}),
					traslationInteractionHandler.onStopDrag.subscribe(() => {
						this.events.offsetEntity.next(this.offset);
					})
				);
				this.addInteraction(VisualizerInteractions.translateInteractionHandler, traslationInteractionHandler);
			} else if (this.mode) {
				const drawInteractionHandler = new Draw({
					type: this.modeDictionary[mode] ? this.modeDictionary[mode].type : mode,
					geometryFunction: this.modeDictionary[mode] ? this.modeDictionary[mode].geometryFunction : undefined,
					condition: (event: any) => (<MouseEvent>event.originalEvent).which === 1,
					style: this.featureStyle.bind(this)
				});

				drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
				this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
			}
			this.events.onChangeMode.next({ mode, forceBroadcast });
		}
	}

	getFeatureBoundingRect(selectedFeature): IAnnotationBoundingRect {
		const { geometry }: any = new OLGeoJSON().writeFeatureObject(selectedFeature);
		const { maxX, maxY, minX, minY } = this.findMinMax(geometry.coordinates);
		const width = `${ maxX - minX }px`;
		const left = `${ minX }px`;
		const height = `${ maxY - minY }px`;
		const top = `${ minY }px`;
		return { left, top, width, height };
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

	onInit() {
		super.onInit();
		const { mapObject: map } = this.iMap;
		map.on('click', this.mapClick);
		map.on('pointermove', this.mapPointermove);
		this.dragBox.on('boxstart', this.mapBoxstart);
		this.dragBox.on('boxdrag', this.mapBoxdrag);
		map.addInteraction(this.dragBox);
	}

	featureAtPixel = (pixel) => {
		const featuresArray = [];
		this.iMap.mapObject.forEachFeatureAtPixel(pixel, feature => {
			featuresArray.push(feature);
		}, { hitTolerance: 2, layerFilter: (layer) => this.vector === layer });
		return this.findFeatureWithMinimumArea(featuresArray);
	};

	onDrawEndEvent({ feature }) {
		const { mode } = this;
		this.setMode(undefined, true);
		const id = UUID.UUID();
		const geometry = feature.getGeometry();
		let cloneGeometry = <any>geometry.clone();
		if (cloneGeometry instanceof olCircle) {
			cloneGeometry = <any>fromCircle(<any>cloneGeometry);
		}
		if (this.offset[0] !== 0 || this.offset[1] !== 0) {
			cloneGeometry.translate(-this.offset[0], -this.offset[1]);
		}
		feature.setGeometry(cloneGeometry);
		feature.setProperties({
			id,
			style: cloneDeep(this.visualizerStyle),
			showMeasures: false,
			showArea: false,
			label: { text: '', geometry: null },
			labelSize: 28,
			icon: this.iconSrc,
			undeletable: false,
			mode
		});
		feature.setId(id);
		this.projectionService
			.projectCollectionAccurately([feature], this.iMap.mapObject)
			.pipe(
				take(1),
				tap((GeoJSON: FeatureCollection<GeometryObject>) => this.events.onDrawEnd.next({ GeoJSON, feature })),
			).subscribe();

	}

	removeInteractions() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.translationSubscriptions.forEach((subscriber) => subscriber.unsubscribe());
		this.translationSubscriptions = [];
		this.removeInteraction(VisualizerInteractions.translateInteractionHandler);
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
		const { mapObject: map } = this.iMap;
		this.removeInteractions();
		map.un('click', this.mapClick);
		map.un('pointermove', this.mapPointermove);
		map.removeInteraction(this.dragBox);

	}

	featureStyle(feature: olFeature, state: string = VisualizerStates.INITIAL) {
		let superStyle = super.featureStyle(feature, state);
		let styles: olStyle[] = Array.isArray(superStyle) ? superStyle : [superStyle];
		const entity = this.getEntity(feature);
		if (entity && entity.showMeasures) {
			styles.push(...this.getMeasuresAsStyles(feature));
		}
		if (entity && entity.showArea) {
			styles.push(...this.areaStyles(feature));
		}
		if (entity && entity.icon) {
			styles.push(this.getCenterIndicationStyle(feature));
		}

		return styles;
	}

	getMeasuresAsStyles(feature: olFeature): olStyle[] {
		const { mode, id } = feature.getProperties();
		const visualizerEntity = this.getEntityById(id);
		const moreStyles: olStyle[] = [];
		let coordinates: any[] = [];
		switch (mode) {
			case 'LineString': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates();
				for (let i = 0; i < coordinates.length - 1; i++) {
					const originalCoordinates: number[][] = [visualizerEntity.featureJson.geometry.coordinates[i], visualizerEntity.featureJson.geometry.coordinates[i + 1]];
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(originalCoordinates)
						})
					}));
				}
			}
				break;
			case 'Polygon':
			case 'Arrow':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < coordinates.length - 1; i++) {
					const originalCoordinates: number[][] = [visualizerEntity.featureJson.geometry.coordinates[0][i], visualizerEntity.featureJson.geometry.coordinates[0][i + 1]];
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(originalCoordinates)
						})
					}));
				}
				break;
			case 'Rectangle': {
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				for (let i = 0; i < 2; i++) {
					const originalCoordinates: number[][] = [visualizerEntity.featureJson.geometry.coordinates[0][i], visualizerEntity.featureJson.geometry.coordinates[0][i + 1]];
					const line: olLineString = new olLineString([coordinates[i], coordinates[i + 1]]);
					moreStyles.push(new olStyle({
						geometry: line,
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength(originalCoordinates)
						})
					}));
				}
			}
				break;
			case 'Circle':
				coordinates = (<olLineString>feature.getGeometry()).getCoordinates()[0];
				const originalC = visualizerEntity.featureJson.geometry.coordinates[0];
				const leftright = this.getLeftRightResult(coordinates);
				const originalLeftRight = this.getLeftRightResult(originalC);
				const line: olLineString = new olLineString([leftright.left, leftright.right]);
				const color = feature.values_.style.initial.stroke;
				moreStyles.push(
					new olStyle({
						geometry: line,
						stroke: new olStroke({
							color,
							width: 1
						}),
					}),
					new olStyle({
						geometry: new olPoint(leftright.right),
						text: new olText({
							...this.measuresTextStyle,
							text: this.formatLength([originalLeftRight.left, originalLeftRight.right]),
							placement: 'point',
							offsetX: 20
						})
					})
				);
				break;
		}
		if (mode === 'Rectangle' || mode === 'Circle') {
			// moreStyles.push(...this.areaCircumferenceStyles(feature));
		}
		return moreStyles;
	}

	getLeftRightResult(coordinates) {
		const leftRight = coordinates.reduce((prevResult, currCoord) => {
			if (currCoord[0] > prevResult.right[0]) {
				return { left: prevResult.left, right: currCoord };
			} else if (currCoord[0] < prevResult.left[0]) {
				return { left: currCoord, right: prevResult.right };
			} else {
				return prevResult;
			}
		}, { left: [Infinity, 0], right: [-Infinity, 0] });
		return leftRight;
	}

	getCenterIndicationStyle(feature: olFeature): olStyle {
		const centerPoint = this.getCenterOfFeature(feature);
		return new olStyle({
			geometry: new olPoint(centerPoint.coordinates),
			image: new olIcon({
				scale: 1,
				src: feature.getProperties().icon
			})

		});
	}

	convertPixelStringToNumeric(pixelString) {
		pixelString.substring(0, pixelString.length - 2);
		return parseInt(pixelString, 10);
	}

	getFeatureWidth(feature) {
		const WidthString = this.getFeatureBoundingRect(feature).width;
		return this.convertPixelStringToNumeric(WidthString);
	}

	getFeatureHeight(feature) {
		const heightString = this.getFeatureBoundingRect(feature).height;
		return this.convertPixelStringToNumeric(heightString);
	}

	areaStyles(feature: any): olStyle[] {
		const geometry = feature.getGeometry();
		const height = this.getFeatureHeight(feature);
		const width = this.getFeatureWidth(feature);
		const calcArea = this.formatArea(geometry);
		const areaText = this.translator.instant('Area');

		return [
			new olStyle({
				text: new olText({
					font: '16px Calibri,sans-serif',
					fill: new olFill({
						color: '#fff'
					}),
					stroke: new olStroke({
						color: '#000',
						width: 3
					}),
					text: `${ calcArea } :${ areaText }`,
					offsetY: height / 2,
					offsetX: - (width / 2)
				})
			})
		];
	}

	removeFeature(featureId: string, internal = false) {
		super.removeEntity(featureId, internal);
		if (!internal) {
			this.events.removeEntity.next(featureId);
		}
		this.events.onSelect.next(this.selected.filter((id) => id !== featureId));
	}

	updateFeature(featureId, props: Partial<IVisualizerEntity>) {
		const entity = this.idToEntity.get(featureId);
		if (entity) {
			entity.originalEntity = merge({}, entity.originalEntity, props);
			this.events.updateEntity.next(entity.originalEntity);
			this.source.refresh();
		}

	}

	setVisibility(isVisible: boolean) {
		super.setVisibility(isVisible);
		this.events.onSelect.next([]);
	}

	public setIconSrc(src: string) {
		this.iconSrc = src;
	}

	labelTranslateMode(featureId: any) {
		let oldFeature = null;
		let event = null;

		if (this.labelTranslate) {
			const { originalFeature } = this.labelTranslate;
			this.removeInteraction(VisualizerInteractions.labelTranslateHandler);
			oldFeature = originalFeature;
		}

		if (!oldFeature || featureId !== oldFeature.getId()) { // start editing
			this.clearAnnotationEditMode();
			const originalFeature: olFeature = this.source.getFeatureById(featureId);
			this.updateFeature(originalFeature.getId(), { labelTranslateOn: true });
			const labelFeature = this.createLabelFeature(originalFeature);

			this.addInteraction(VisualizerInteractions.labelTranslateHandler, this.moveLabelInteraction(originalFeature, labelFeature));
			event = {
				originalFeature,
				labelFeature
			};
			this.source.addFeature(labelFeature);
		} else {
			this.updateFeature(featureId, { labelTranslateOn: false });
			this.source.removeFeature(this.labelTranslate.labelFeature);
		}
		this.events.onLabelTranslateStart.next(event);
	}

	setEditAnnotationMode(featureId: string, enable: boolean) {
		this.clearLabelTranslateMode();
		let event = undefined;
		let centerFeature;
		let feature;
		if (enable) {
			feature = this.source.getFeatureById(featureId);
			if (centerFeature) {
				this.source.removeFeature(centerFeature);
			}
			centerFeature = this.createCenterFeatureToDrag(feature);
			if (feature.get('mode') !== 'Point') {
				this.addInteraction(VisualizerInteractions.modifyInteractionHandler, this.createModifyInteraction(feature));
			}
			this.addInteraction(VisualizerInteractions.editAnnotationTranslateHandler, this.createAnnotationTranslateInteraction(feature, centerFeature));
			this.source.addFeature(centerFeature);
			event = {
				originalFeature: feature,
				centerFeature
			}

		} else {
			centerFeature = this.currentAnnotationEdit.centerFeature;
			this.removeInteraction(VisualizerInteractions.editAnnotationTranslateHandler);
			this.removeInteraction(VisualizerInteractions.modifyInteractionHandler);
			if (centerFeature) {
				this.source.removeFeature(centerFeature);
			}
		}
		this.events.onAnnotationEditStart.next(event);
	}


	private createCenterFeatureToDrag(feature: olFeature) {
		const center = this.getCenterOfFeature(feature);
		const centerFeature = new olFeature(new olPoint(center.coordinates));
		centerFeature.setStyle(new olStyle({
			image: new olIcon({
				src: 'assets/icons/dragIcon.svg'
			})
		}));
		return centerFeature;

	}

	private createModifyInteraction(feature: olFeature) {
		const modify = new olModify({
			features: new olCollection([feature])
		});

		modify.on('modifystart', () => {
			if (['Rectangle'].includes(feature.get('mode'))) {
				feature.set('mode', 'Polygon');
			}
		});

		modify.on('modifyend', (event) => {
			const features = [feature];
			feature.getGeometry().translate(-this.offset[0], -this.offset[1]);
			const { geometry } = feature.get('label');
			if (geometry) {
				features.push(new olFeature(geometry));
			}
			this.projectionService.projectCollectionAccurately(features, this.iMap.mapObject).pipe(
				take(1),
				tap((GeoJSON: FeatureCollection<GeometryObject>) => this.annotationEditEnd(GeoJSON, feature))
			).subscribe();
		});

		return modify;
	}

	private createAnnotationTranslateInteraction(feature: olFeature, center: olFeature) {
		const { geometry } = feature.get('label');
		const translate = new olTranslate({
			features: new olCollection([center]),
			hitToTolerance: 3
		});
		translate.on('translatestart', (event) => {
			const lastCoordinate = event.coordinate;
			center.set('lastCoordinate', lastCoordinate);
		});
		translate.on('translating', (event) => {

			const currentCoordinates = event.coordinate;
			const lastCoordinates = center.get('lastCoordinate');
			const deltaX = currentCoordinates[0] - lastCoordinates[0];
			const deltaY = currentCoordinates[1] - lastCoordinates[1];
			center.set('lastCoordinate', currentCoordinates);
			feature.getGeometry().translate(deltaX, deltaY);
			if (geometry) {
				geometry.translate(deltaX, deltaY);
			}

		});
		translate.on('translateend', (event) => {
			const features = [feature];
			feature.getGeometry().translate(-this.offset[0], -this.offset[1]);
			if (geometry) {
				features.push(new olFeature(geometry));
			}
			center.unset('lastCoordinate');
			this.projectionService.projectCollectionAccurately(features, this.iMap.mapObject).pipe(
				take(1),
				tap((GeoJSON: FeatureCollection<GeometryObject>) => this.annotationEditEnd(GeoJSON, feature))
			).subscribe();
		});

		return translate;
	}

	private annotationEditEnd(GeoJSON: FeatureCollection<GeometryObject>, feature: olFeature) {
		this.events.onAnnotationEditEnd.next({ GeoJSON, feature });
		// reset all -edit annotation- interactions so the annotation will response to the interaction after it update.
		this.setEditAnnotationMode(feature.getId(), false);
		this.setEditAnnotationMode(feature.getId(), true);
	}

	private createLabelFeature(feature: olFeature): olFeature {
		let labelPostion = this.getCenterOfFeature(feature);
		const entity = this.getEntity(feature);
		const { mode: entityMode } = feature.getProperties();
		const { label } = feature.getProperties();
		if (label.geometry) {
			const labelPoint = this.geoJsonFormat.writeGeometryObject(label.geometry);
			labelPoint.coordinates[0] += this.offset[0];
			labelPoint.coordinates[1] += this.offset[1];
			labelPostion = labelPoint;
		}
		const labelFeature = new olFeature({
			geometry: new olPoint(labelPostion.coordinates),
		});
		labelFeature.setStyle(new olStyle({
			text: new olText({
				font: `${ entity.labelSize + 2 }px Calibri,sans-serif`,
				fill: new olFill({ color: entity.style.initial.label.fill }),
				text: label.text,
				offsetY: 30
			})
		}));

		return labelFeature;
	}

	private moveLabelInteraction(originalFeature: olFeature, labelFeature: olFeature): olTranslate {
		const translateInteraction = new olTranslate({
			features: new olCollection([labelFeature]),
			hitTolerance: 2
		});
		translateInteraction.on('translateend', (translateend) => {
			const newCoord = this.geoJsonFormat.writeGeometryObject(translateend.features.item(0).getGeometry());
			newCoord.coordinates[0] -= this.offset[0];
			newCoord.coordinates[1] -= this.offset[1];
			this.projectionService.projectAccurately(newCoord, this.iMap.mapObject).subscribe((accuracyPoint) => {
				this.updateFeature(originalFeature.getId(), {
					label: {
						text: originalFeature.get('label').text,
						geometry: accuracyPoint
					}
				});
				this.purgeCache(originalFeature);
				this.featureStyle(originalFeature);
			})
		});

		return translateInteraction;
	}

	private clearLabelTranslateMode() {
		if (this.labelTranslate) {
			this.updateFeature(this.labelTranslate.originalFeature.getId(), { labelTranslateOn: false });
			this.removeInteraction(VisualizerInteractions.labelTranslateHandler);
			this.source.removeFeature(this.labelTranslate.labelFeature);
			this.labelTranslate = null;
		}
	}

	onResetView(): Observable<boolean> {
		this.clearLabelTranslateMode();
		this.clearAnnotationEditMode();
		return super.onResetView();
	}

	dispose() {
		this.clearLabelTranslateMode();
		this.clearAnnotationEditMode();
		super.dispose();
	}

	protected mapClick = (event) => {
		if (this.mapSearchIsActive || this.mode || this.isHidden) {
			return;
		}
		const { shiftKey: multi } = event.originalEvent;
		const selectedFeature = this.featureAtPixel(event.pixel);
		let ids = [];
		if (selectedFeature) {
			const featureId = selectedFeature.getId();
			ids = multi ? this.selected.includes(featureId) ? this.selected.filter(id => id !== featureId) : [...this.selected, featureId] : [featureId];
		} else {
			ids = multi ? this.selected : [];
		}
		this.events.onSelect.next(ids);
	};

	protected mapPointermove = (event) => {
		if (this.mapSearchIsActive || this.mode) {
			return;
		}
		const selectedFeature = this.featureAtPixel(event.pixel);
		this.events.onHover.next(selectedFeature ? selectedFeature.getId() : null);
	};

	protected mapBoxstart = () => {
		this.events.onSelect.next([]);
	};

	protected mapBoxdrag = ({ target }) => {
		if (this.isHidden) {
			return;
		}
		const extent = target.getGeometry().getExtent();
		const selected = [];
		this.vector.getSource().forEachFeatureIntersectingExtent(extent, (feature) => {
			selected.push(feature.getId());
		});
		this.events.onSelect.next(selected);
	};

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

	clearAnnotationEditMode() {
		if (this.currentAnnotationEdit) {
			this.setEditAnnotationMode(this.currentAnnotationEdit.originalFeature.getId(), false)
		}
	}
}
