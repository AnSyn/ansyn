import Feature from 'ol/Feature';
import Collection from 'ol/Collection';
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
import VectorLayer from 'ol/layer/Vector';
import SourceVector from 'ol/source/Vector';
import Select from 'ol/interaction/Select';
import { UUID } from 'angular2-uuid';
import {
	getPointByGeometry,
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	MarkerSize,
	VisualizerInteractions,
	VisualizersConfig,
	VisualizerStates
} from '@ansyn/imagery';
import { FeatureCollection, GeometryObject } from 'geojson';
import { combineLatest, Observable } from 'rxjs';
import { selectActiveMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import {
	IMeasureData,
	selectIsMeasureToolActive,
	selectMeasureDataByMapId
} from '../../../../../menu-items/tools/reducers/tools.reducer';
import { Inject } from '@angular/core';
import { UpdateMeasureDataAction } from '../../../../../menu-items/tools/actions/tools.actions';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, VisualizersConfig],
	isHideable: true
})
export class MeasureDistanceVisualizer extends EntitiesVisualizer {
	labelToMeasures: Map<string, { features: Feature[], handlers: Translate[] }> = new Map();
	isTotalMeasureActive: boolean;
	measureData: IMeasureData;
	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;
	protected hoverLayer: VectorLayer;

	protected allLengthTextStyle = new Text({
		font: '16px Calibri,sans-serif',
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

	constructor(protected store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
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
		this.geoJsonFormat = new GeoJSON();
	}

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	@AutoSubscription
	show$ = () => combineLatest(
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMeasureDataByMapId(this.mapId)),
		this.store$.select(selectIsMeasureToolActive)).pipe(
		distinctUntilChanged(),
		filter(([activeMapId, measureData, isMeasureToolActive]) => Boolean(measureData)),
		tap(([activeMapId, measureData, isMeasureToolActive]) => {
			this.measureData = measureData;
			this.setVisibility(measureData.isLayerShowed);
			if (isMeasureToolActive && activeMapId && measureData.isToolActive) {
				this.createDrawInteraction();
			} else {
				this.removeDrawInteraction();
			}
			if (isMeasureToolActive && activeMapId && measureData.isRemoveMeasureModeActive) {
				this.createDeleteInteraction();
				this.createClickDeleteInteraction();
			} else {
				this.removeDeleteInteraction();
				this.removeClickDeleteInteraction();
			}
		}),
		switchMap(([activeMapId, measureData, isMeasureToolActive]) => {
			return this.setEntities(measureData.meausres);
		}),
		filter(Boolean),
		tap(() => this.setLabelsFeature())
	);

	createDeleteInteraction() {
		this.removeDeleteInteraction();
		const pointerMove = new Select({
			condition: condition.pointerMove,
			style: () => new Style(),
			layers: [this.vector]
		});
		pointerMove.on('select', this.onHoveredFeature.bind(this));
		this.addInteraction(VisualizerInteractions.pointerMove, pointerMove);
	}

	removeDeleteInteraction() {
		this.removeInteraction(VisualizerInteractions.pointerMove);
	}

	createClickDeleteInteraction() {
		const click = new Select({
			condition: condition.click,
			style: () => new Style({}),
			layers: [this.vector]
		});
		click.on('select', this.onClickDeleteFeature.bind(this));
		this.addInteraction(VisualizerInteractions.click, click);
	}

	onClickDeleteFeature($event) {
		this.removeClickDeleteInteraction();
		if ($event.selected.length > 0) {
			const feature = $event.selected[0];
			const entity = this.getEntity(feature);
			if (entity) {
				this.measureData.meausres = this.measureData.meausres.filter((measureEntity) => measureEntity.id !== entity.id);
				this.store$.dispatch(new UpdateMeasureDataAction({
					mapId: this.mapId,
					measureData: { meausres: this.measureData.meausres }
				}));
				this.hoverLayer.getSource().clear();
			}
		}
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

	onHoveredFeature($event) {
		if ($event.selected.length > 0) {
			const id = $event.selected[0].getId();
			this.setHoverFeature(id);
		} else {
			this.setHoverFeature();
		}
	}

	setHoverFeature(featureId?: string) {
		this.hoverLayer.getSource().clear();

		if (featureId) {
			const feature = this.source.getFeatureById(featureId);
			if (feature) {
				this.createHoverFeature(feature);
			}
		}
	}

	private createHoverFeature(selectedFeature: Feature): void {
		const hoverFeature = selectedFeature.clone();
		const styles = this.hoverStyle(hoverFeature);
		hoverFeature.setStyle(styles);
		this.hoverLayer.getSource().addFeature(hoverFeature);
	}

	protected initLayers() {
		super.initLayers();
		this.createHoverLayer();
	}

	protected createHoverLayer() {
		if (this.hoverLayer) {
			this.iMap.removeLayer(this.hoverLayer);
		}

		this.hoverLayer = new VectorLayer({
			source: new SourceVector(),
			style: (feature: Feature) => this.featureStyle(feature, VisualizerStates.HOVER)
		});

		this.iMap.addLayer(this.hoverLayer);
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

	onDrawEndEvent(data) {
		this.projectionService.projectCollectionAccurately([data.feature], this.iMap.mapObject)
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [featureJson] = featureCollection.features;
				const newEntity: IVisualizerEntity = {
					id: UUID.UUID(),
					featureJson
				};
				this.measureData.meausres.push(newEntity);
				this.store$.dispatch(
					new UpdateMeasureDataAction({
						mapId: this.mapId,
						measureData: {
							meausres: this.measureData.meausres
						}
					})
				);
			});
	}

	// override base entities visualizer style
	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		let styles;
		if (typeof state === 'object' && state === 'hover') {
			styles = this.hoverStyle(feature);
		} else {
			styles = this.mainStyle(feature)
		}
		return styles;
	}

	// draw style (temp until DBClick)
	drawFeatureStyle(feature: Feature) {
		const styles = [this.editDistanceStyle];
		const measureStyles = this.getMeasureTextStyle(feature);
		measureStyles.forEach((style) => {
			styles.push(style);
		});
		return styles;
	}

	// Line style (after DBClick)
	mainStyle(feature) {
		const styles = [new Style({
			stroke: new Stroke({
				color: this.visualizerStyle.initial.stroke,
				width: this.visualizerStyle.initial['stroke-width']
			})
		})];
		// Points
		const pointsStyle = new Style({
			image: new Circle({
				radius: 5,
				stroke: new Stroke({
					color: this.visualizerStyle.initial.stroke,
					width: this.visualizerStyle.initial['stroke-width']
				}),
				fill: new Fill({ color: this.visualizerStyle.initial.fill })
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
				const centroid = getPointByGeometry(<any>{
					type: lineString.getType(),
					coordinates: lineString.getCoordinates()
				});
				const segmentLengthText = this.measureApproximateLength(lineString, projection);
				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();
				singlePointLengthTextStyle.setText(segmentLengthText);
				styles.push(new Style({
					geometry: new Point(<[number, number]>centroid.coordinates),
					text: singlePointLengthTextStyle
				}));
			});
		}

		if (this.isTotalMeasureActive || length === 2) {
			// all line string
			const allLengthText = this.measureApproximateLength(geometry, projection);
			this.allLengthTextStyle.setText(allLengthText);
			let allLinePoint = new Point(geometry.getCoordinates()[0]);

			if (calculateCenterOfMass) {
				const featureId = <string>feature.getId();
				const entityMap = this.idToEntity.get(featureId);
				if (entityMap) {
					const featureGeoJson = <any>this.geoJsonFormat.writeFeatureObject(entityMap.feature);
					const centroid = getPointByGeometry(featureGeoJson.geometry);
					allLinePoint = new Point(<[number, number]>centroid.coordinates);
				}
			}

			styles.push(new Style({
				geometry: allLinePoint,
				text: this.allLengthTextStyle
			}));
		}
		return styles;
	}

	private createMeasureLabelsFeatures(feature, featureGeoJson: geoJsonLineString) {
		// @TODO: try to make this and getMeasureTextStyle one function
		const features = [];
		const geometry = <LineString>feature.getGeometry();

		// text points
		const coordinates = geometry.getCoordinates();
		const length = coordinates.length;
		if (length > 2) {
			for (let i = 0; i < featureGeoJson.coordinates.length - 1; i++) {
				const lineString = new LineString([coordinates[i], coordinates[i + 1]]);
				const centroid = getPointByGeometry(<any>{
					type: lineString.getType(),
					coordinates: lineString.getCoordinates()
				});
				const segmentLengthText = this.formatLength([featureGeoJson.coordinates[i], featureGeoJson.coordinates[i + 1]]);
				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();
				singlePointLengthTextStyle.setText(segmentLengthText);
				const labelFeature = new Feature({
					geometry: new Point(<[number, number]>centroid.coordinates),
				});
				labelFeature.setStyle(new Style({
					text: singlePointLengthTextStyle
				}));
				features.push(labelFeature);
			}
		}

		if (this.isTotalMeasureActive || length === 2) {
			// all line string
			const allLengthText = this.formatLength(featureGeoJson.coordinates);
			const lengthText = this.allLengthTextStyle.clone();
			lengthText.setText(allLengthText);
			let allLinePoint = new Point(geometry.getCoordinates()[0]);
			const featureId = <string>feature.getId();
			const entityMap = this.idToEntity.get(featureId);
			if (entityMap) {
				const featureGeoJson = <any>this.geoJsonFormat.writeFeatureObject(entityMap.feature);
				const centroid = getPointByGeometry(featureGeoJson.geometry);
				allLinePoint = new Point(<[number, number]>centroid.coordinates);
			}
			const labelFeature = new Feature({
				geometry: allLinePoint
			});
			labelFeature.setStyle(new Style({
				text: lengthText
			}));
			features.push(labelFeature);
		}
		return features;
	}

	clearLabelInteractions() {
		if (this.labelToMeasures && this.labelToMeasures.size) {
			const labelToMeasureIterator = this.labelToMeasures.values();
			let val = labelToMeasureIterator.next().value;
			while (val) {
				val.handlers.forEach(handler => this.iMap.mapObject.removeInteraction(handler));
				val = labelToMeasureIterator.next().value;
			}
		}
	}

	clearLabelInteractionsAndFeaturesById(id: string) {
		if (!this.labelToMeasures.has(id)) {
			return;
		}

		const measureLabels = this.labelToMeasures.get(id);
		measureLabels.handlers.forEach(handler => this.iMap.mapObject.removeInteraction(handler));
		measureLabels.features.forEach((feature) => {
			this.source.removeFeature(feature);
		})
	}

	private setLabelsFeature() {
		if (!this.measureData.meausres.length) {
			this.source.clear();
			this.clearLabelInteractions();
			this.labelToMeasures.clear();
		}

		// remove old measures
		Array.from(this.labelToMeasures.keys())
			.filter((measureLabels: string) => {
				return this.measureData.meausres.find((measure: IVisualizerEntity) => measureLabels !== measure.id)
			})
			.forEach((key: string) => {
				this.clearLabelInteractionsAndFeaturesById(key);
				this.labelToMeasures.delete(key);
			});

		// add new measures
		this.measureData.meausres
			.filter((measure: IVisualizerEntity) => !this.labelToMeasures.has(measure.id))
			.forEach((measure: IVisualizerEntity) => {
				const feature = this.source.getFeatureById(measure.id);
				const labelsFeatures = this.createMeasureLabelsFeatures(feature, measure.featureJson.geometry);
				const translateHandlers = this.defineLabelsTranslate(labelsFeatures);
				translateHandlers.forEach(handler => this.iMap.mapObject.addInteraction(handler));
				this.labelToMeasures.set(measure.id, { features: labelsFeatures, handlers: translateHandlers });
				this.source.addFeatures(labelsFeatures);
			})
	}

	private defineLabelsTranslate(labelsFeatures: Feature[]) {
		return labelsFeatures.map(feature => new Translate({ features: new Collection([feature]) }));
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
