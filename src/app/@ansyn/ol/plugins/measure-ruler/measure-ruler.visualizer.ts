import Feature from 'ol/Feature';
import Draw from 'ol/interaction/Draw';
import Translate from 'ol/interaction/Translate';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import MultiPoint from 'ol/geom/MultiPoint';
import LineString from 'ol/geom/LineString';
import { LineString as geoJsonLineString } from 'geojson';
import VectorSource from 'ol/source/Vector';
import * as Sphere from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import * as condition from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { UUID } from 'angular2-uuid';
import {
	getPointByGeometry,
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	MarkerSize,
	VisualizerInteractions,
	VisualizerStates,
	VisualizersConfig,
	toDegrees
} from '@ansyn/imagery';
import { FeatureCollection, GeometryObject } from 'geojson';
import { Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { EntitiesVisualizer } from '../entities-visualizer';
import { OpenLayersProjectionService } from '../../projection/open-layers-projection.service';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';

export interface ILabelHandler {
	select: Select;
	translate: Translate;
}

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [OpenLayersProjectionService, VisualizersConfig],
	isHideable: true
})
export class MeasureRulerVisualizer extends EntitiesVisualizer {
	labelToMeasures: Map<string, { features: Feature[], handler: ILabelHandler }> = new Map();
	isTotalMeasureActive: boolean;
	isAzimuthAngleActive: boolean;
	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;
	hoveredMeasureId: string;
	onHiddenStateChanged = new Subject();
	azimuthDigitsAfterDot = 0;
	measurePositionInEndPoint = true;

	protected allLengthTextStyle = new Text({
		font: '16px Calibri,sans-serif',
		backgroundFill: new Fill({
			color: this.colorWithAlpha('#000000', 0.5),
		}),
		fill: new Fill({
			color: '#fff'
		}),
		stroke: new Stroke({
			color: '#000',
			width: 3
		}),
		offsetY: 30
	});
	protected editDistanceStyle = new Style({
		fill: new Fill({
			color: 'rgba(255, 255, 255, 0.2)'
		}),
		stroke: new Stroke({
			color: 'yellow',
			lineDash: [10, 10],
			width: 2
		}),
		image: new Circle({
			radius: 5,
			stroke: new Stroke({
				color: 'rgba(0, 0, 0, 0.7)'
			}),
			fill: new Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			})
		}),
		zIndex: 3
	});

	constructor(protected projectionService: OpenLayersProjectionService,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(config.MeasureDistanceVisualizer, {
			initial: {
				stroke: '#3399CC',
				'stroke-width': 2,
				fill: '#FFFFFF',
				'marker-size': MarkerSize.small,
				'marker-color': '#FFFFFF',
				zIndex: 5
			},
			hover: {
				stroke: '#ccb918',
				'stroke-width': 2,
				fill: '#61ff55',
				'marker-size': MarkerSize.small,
				'marker-color': '#ff521a',
				zIndex: 5
			}
		});
		this.isTotalMeasureActive = config.MeasureDistanceVisualizer.extra.isTotalMeasureActive;
		this.isAzimuthAngleActive = (config && config.MeasureDistanceVisualizer && config.MeasureDistanceVisualizer.extra && config.MeasureDistanceVisualizer.extra.isAzimuthAngleActive) || true;
		this.geoJsonFormat = new GeoJSON();
	}

	onInitSubscriptions() {
		super.onInitSubscriptions();
		this.onHiddenStateChanged.next();
	}

	enableRuler(activate: boolean) {
		if (activate) {
			this.createDrawInteraction();
		} else {
			this.removeDrawInteraction();
		}
	}

	startDeleteSingleEntity(activate: boolean) {
		if (activate) {
			this.createHoverForDeleteInteraction();
			this.createClickDeleteInteraction();
		} else {
			this.removeHoverForDeleteInteraction();
			this.removeClickDeleteInteraction();
		}
	}

	clearRulerEntities() {
		this.clearEntities();
		this.setLabelsFeature([]);
	}

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	// override base method
	setVisibility(isVisible: boolean) {
		super.setVisibility(isVisible);
		this.onHiddenStateChanged.next();
	}

	createHoverForDeleteInteraction() {
		this.removeHoverForDeleteInteraction();
		const pointerMove = new Select({
			condition: condition.pointerMove,
			style: this.hoverStyle.bind(this),
			layers: [this.vector]
		});
		pointerMove.on('select', this.onHoveredFeature.bind(this));
		this.addInteraction(VisualizerInteractions.pointerMove, pointerMove);
	}

	onHoveredFeature($event) {
		if ($event.selected.length > 0) {
			this.hoveredMeasureId = $event.selected[0].getId();
		} else {
			this.hoveredMeasureId = null;
		}
	}

	removeHoverForDeleteInteraction() {
		this.removeInteraction(VisualizerInteractions.pointerMove);
	}

	createClickDeleteInteraction() {
		this.removeClickDeleteInteraction();
		const click = new Select({
			condition: condition.click,
			style: () => new Style({}),
			layers: [this.vector]
		});
		click.on('select', this.onClickDeleteFeature.bind(this));
		this.addInteraction(VisualizerInteractions.click, click);
	}

	onClickDeleteFeature($event) {
		if ($event.selected.length > 0 && this.hoveredMeasureId === $event.selected[0].getId()) {
			const feature = $event.selected[0];
			const entity = this.getEntity(feature);
			if (entity) {
				this.clearLabelInteractionsAndFeaturesById(entity.id);
				this.afterEntityDeleted(entity);
				this.hoveredMeasureId = null;
			}
		}
	}

	afterEntityDeleted(entity: IVisualizerEntity) {
		this.removeEntity(entity.id);

		const entities = this.getEntities();
		this.setLabelsFeature(entities);
	}

	removeClickDeleteInteraction() {
		this.removeInteraction(VisualizerInteractions.click);
	}

	getSinglePointLengthTextStyle(): Text {
		return new Text({
			font: '14px Calibri,sans-serif',
			fill: new Fill({
				color: '#FFFFFF'
			}),
			backgroundFill: new Fill({
				color: this.colorWithAlpha('#000000', 0.5),
			}),
			stroke: new Stroke({
				color: '#000',
				width: 3
			}),
			offsetY: 30
		});
	}

	onResetView(): Observable<boolean> {
		return super.onResetView()
			.pipe(tap(() => {
				if (this.drawInteractionHandler) {
					this.createDrawInteraction();
				}
			}));
	}

	protected initLayers() {
		super.initLayers();
	}

	createDrawInteraction(type = 'LineString') {
		this.removeDrawInteraction();

		this.interactionSource = new VectorSource({ wrapX: false });

		const drawInteractionHandler = new Draw(<any>{
			source: this.interactionSource,
			type: type,
			condition: (event) => event.originalEvent.which === 1,
			style: this.drawFeatureStyle.bind(this)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	get isRulerEnabled(): boolean {
		return this.interactions.has(VisualizerInteractions.drawInteractionHandler);
	}

	get isRulerRemoveEntitiesEnabled(): boolean {
		return this.interactions.has(VisualizerInteractions.pointerMove);
	}

	onDrawEndEvent(data) {
		this.projectionService.projectCollectionAccurately([data.feature], this.iMap.mapObject)
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [featureJson] = featureCollection.features;
				const newEntity: IVisualizerEntity = {
					id: UUID.UUID(),
					featureJson
				};
				this.afterDrawEndEvent(newEntity);
			});
	}

	afterDrawEndEvent(entity: IVisualizerEntity) {
		this.addOrUpdateEntities([entity]).pipe(take(1)).subscribe();

		const entities = this.getEntities();
		this.setLabelsFeature(entities);
	}

	protected setLabelsFeature(entities: IVisualizerEntity[]) {
		if (!entities.length) {
			this.source.clear();
			this.clearLabelInteractions();
			this.labelToMeasures.clear();
		}

		// add new measures
		entities
			.filter((measure: IVisualizerEntity) => !this.labelToMeasures.has(measure.id))
			.forEach((measure: IVisualizerEntity) => {
				const feature = this.source.getFeatureById(measure.id);
				const labelsFeatures = this.createMeasureLabelsFeatures(feature, measure.featureJson.geometry);
				const labelHandler: ILabelHandler = this.defineLabelsTranslate(labelsFeatures);
				this.iMap.mapObject.addInteraction(labelHandler.select);
				this.iMap.mapObject.addInteraction(labelHandler.translate);
				this.labelToMeasures.set(measure.id, { features: labelsFeatures, handler: labelHandler });
				this.source.addFeatures(labelsFeatures);
			})
	}

	featurePointsStyle(initial) {
		const pointsStyle = new Style({
			image: new Circle({
				radius: 5,
				stroke: new Stroke({
					color: initial.stroke,
					width: initial['stroke-width']
				}),
				fill: new Fill({ color: initial.fill })
			}),
			geometry: function (feature) {
				// return the coordinates of the first ring of the polygon
				const coordinates = (<LineString>feature.getGeometry()).getCoordinates();
				return new MultiPoint(coordinates);
			}
		});
		return pointsStyle;
	}

	featureStrokeStyle(initial) {
		const stroke = new Style({
			stroke: new Stroke({
				color: initial.stroke,
				width: initial['stroke-width']
			})
		});
		return stroke;
	}

	// The feature after created
	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		return this.measurementMainStyle();
	}

	// Style in draw mode
	drawFeatureStyle(feature: Feature) {
		const styles = this.getMeasureTextStyle(feature);
		styles.push(this.editDistanceStyle);
		return styles;
	}

	measurementMainStyle() {
		const { initial } = this.visualizerStyle;
		const styles = [this.featureStrokeStyle(initial)];
		styles.push(this.featurePointsStyle(initial));
		return styles;
	}

	hoverStyle(feature) {
		const styles = [new Style({
			stroke: new Stroke({
				color: this.visualizerStyle.hover.stroke,
				width: this.visualizerStyle.hover['stroke-width']
			})
		})];
		// Points
		const pointsStyle = new Style({
			image: new Circle({
				radius: 5,
				stroke: new Stroke({
					color: this.visualizerStyle.hover.stroke,
					width: this.visualizerStyle.hover['stroke-width']
				}),
				fill: new Fill({ color: this.visualizerStyle.hover.fill })
			}),
			geometry: function (feature) {
				// return the coordinates of the first ring of the polygon
				const coordinates = (<LineString>feature.getGeometry()).getCoordinates();
				return new MultiPoint(coordinates);
			}
		});
		styles.push(pointsStyle);
		return styles;
	}

	// points string styles
	getMeasureTextStyle(feature: Feature, calculateCenterOfMass = false) {
		const styles = [];
		const geometry = <LineString>feature.getGeometry();

		if (geometry.getType() === 'Point') {
			return styles;
		}
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();

		// text points
		const length = geometry.getCoordinates().length;
		if (length > 2) {
			geometry.forEachSegment((start, end) => {
				const lineString = new LineString([start, end]);
				const textPosition = this.getMeasurePosition(start, end);
				const segmentLengthText = this.measureApproximateLength(lineString, projection);

				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();

				if (this.isAzimuthAngleActive) {
					// find azimuth
					const angle = this.getAzimuth(start, end);
					singlePointLengthTextStyle.setText(angle + String.fromCharCode(176) + '\n' + segmentLengthText);
				} else {
					singlePointLengthTextStyle.setText(segmentLengthText);
				}

				styles.push(new Style({
					geometry: new Point(<[number, number]>textPosition.coordinates),
					text: singlePointLengthTextStyle
				}));
			});
		}
		if (this.isTotalMeasureActive || length === 2) {
			const coords = geometry.getCoordinates();
			// all line string
			let position;
			const allLengthText = this.measureApproximateLength(geometry, projection);
			if (this.isAzimuthAngleActive && length === 2) {
				// find azimuth
				const angle = this.getAzimuth(coords[0], coords[1]);
				this.allLengthTextStyle.setText(angle + String.fromCharCode(176) + '\n' + String.fromCharCode(931) + ' ' + allLengthText);
				position = this.getMeasurePosition(coords[0], coords[coords.length - 1]);
			} else {
				this.allLengthTextStyle.setText(String.fromCharCode(931) + ' ' + allLengthText)
				position = {
					type: 'Point',
					coordinates: coords[0]
				};
			}
			const allLinePoint = new Point(<[number, number]>position.coordinates);
			styles.push(new Style({
				geometry: allLinePoint,
				text: this.allLengthTextStyle
			}));
		}
		return styles;
	}

	getMeasurePosition(sourceCoords: [number, number], destCoords: [number, number]): Point {
		let textPosition: Point;
		if (!this.measurePositionInEndPoint) {
			textPosition = getPointByGeometry(<any>{
				type: 'LineString',
				coordinates: [sourceCoords, destCoords]
			});
		} else { // at the end
			textPosition = {
				type: Point.type,
				coordinates: destCoords
			}
		}
		return textPosition;
	}

	protected createMeasureLabelsFeatures(feature, featureGeoJson: geoJsonLineString) {
		// @TODO: try to make this and getMeasureTextStyle one function
		const features = [];
		const geometry = <LineString>feature.getGeometry();

		// text points
		const coordinates = geometry.getCoordinates();
		const length = coordinates.length;
		if (length > 2) {
			for (let i = 0; i < featureGeoJson.coordinates.length - 1; i++) {
				const textPosition = this.getMeasurePosition(coordinates[i], coordinates[i + 1]);
				const segmentLengthText = this.formatLength([featureGeoJson.coordinates[i], featureGeoJson.coordinates[i + 1]]);
				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();

				if (this.isAzimuthAngleActive) {
					// find azimuth
					const angle = this.getAzimuth(featureGeoJson.coordinates[i], featureGeoJson.coordinates[i + 1]);
					singlePointLengthTextStyle.setText(angle + String.fromCharCode(176) + '\n' + segmentLengthText);
				} else {
					singlePointLengthTextStyle.setText(segmentLengthText);
				}
				const labelFeature = new Feature({
					geometry: new Point(<[number, number]>textPosition.coordinates),
				});
				labelFeature.setStyle(new Style({
					text: singlePointLengthTextStyle
				}));
				features.push(labelFeature);
			}
		}

		if (this.isTotalMeasureActive || length === 2) {
			// all line string
			let textPosition;
			const allLengthText = this.formatLength(featureGeoJson.coordinates);
			if (this.isAzimuthAngleActive && length === 2) {
				// find azimuth
				const angle = this.getAzimuth(coordinates[0], coordinates[coordinates.length - 1]);
				this.allLengthTextStyle.setText(angle + String.fromCharCode(176) + '\n' + String.fromCharCode(931) + ' ' + allLengthText);
				textPosition = this.getMeasurePosition(coordinates[0], coordinates[coordinates.length - 1]);
			} else {
				this.allLengthTextStyle.setText(String.fromCharCode(931) + ' ' + allLengthText);
				textPosition = {
					type: Point.type,
					coordinates: coordinates[0]
				};
			}
			const lengthText = this.allLengthTextStyle.clone();
			const labelFeature = new Feature({
				geometry: new Point(textPosition.coordinates)
			});
			labelFeature.setStyle(new Style({
				text: lengthText
			}));
			features.push(labelFeature);
		}
		features.forEach(feature => feature.setId(UUID.UUID()));
		return features;
	}

	getAzimuth(source, dest) {
		const rad = Math.atan2((dest[0] - source[0]), (dest[1] - source[1]));
		let deg = toDegrees(rad);
		deg = (deg + 360) % 360;
		return deg.toFixed(this.azimuthDigitsAfterDot);
	}

	clearLabelInteractions() {
		if (this.labelToMeasures && this.labelToMeasures.size) {
			const labelToMeasureIterator = this.labelToMeasures.values();
			let val = labelToMeasureIterator.next().value;
			while (val) {
				this.iMap.mapObject.removeInteraction(val.handler.select);
				this.iMap.mapObject.removeInteraction(val.handler.translate);
				val = labelToMeasureIterator.next().value;
			}
		}
	}

	clearLabelInteractionsAndFeaturesById(id: string) {
		if (!this.labelToMeasures.has(id)) {
			return;
		}

		const measureLabels = this.labelToMeasures.get(id);
		this.iMap.mapObject.removeInteraction(measureLabels.handler.translate);
		this.iMap.mapObject.removeInteraction(measureLabels.handler.select);
		measureLabels.features.forEach((feature) => {
			this.source.removeFeature(feature);
		})
	}

	protected defineLabelsTranslate(labelsFeatures: Feature[]): ILabelHandler {
		const handler: ILabelHandler = { select: undefined, translate: undefined };
		handler.select = new Select({
			condition: (event) => event.type === 'pointermove' && !event.dragging,
			style: (event) => {
				if (event.getGeometry().getType() === 'LineString') {
					return event.styleCache;
				}
				return new Style({})
			},
			filter: (feature, layer) => {
				return labelsFeatures.indexOf(feature) >= 0 || Array.from(this.labelToMeasures).some((labelMeasure => labelMeasure[1].features.indexOf(feature) >= 0));
			}
		});
		handler.translate = new Translate({
			features: handler.select.getFeatures()
		});

		return handler;
	}

	/**
	 * Format length output.
	 * @param line The line.
	 * @param projection The Projection.
	 */
	measureApproximateLength(line, projection): string {
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

	onDispose(): void {
		this.clearLabelInteractions();
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.removeInteraction(VisualizerInteractions.click);
		super.onDispose();
	}
}
