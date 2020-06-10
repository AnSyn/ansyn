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
import { FeatureCollection, GeometryObject, LineString as GeoJsonLineString, Point as GeoJsonPoint } from 'geojson';
import VectorSource from 'ol/source/Vector';
import { getLength } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import { pointerMove as pointerMoveCondition, click as clickCondition } from 'ol/events/condition';
import Select from 'ol/interaction/Select';
import { UUID } from 'angular2-uuid';
import {
	calculateLineDistance,
	getPointByGeometry,
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	MarkerSize,
	VisualizerInteractions,
	VisualizersConfig,
	VisualizerStates
} from '@ansyn/imagery';
import { combineLatest, Observable, Subject } from 'rxjs';
import { selectActiveMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { distinctUntilChanged, filter, switchMap, tap, take } from 'rxjs/operators';
import {
	IMeasureData,
	selectIsMeasureToolActive,
	selectMeasureDataByMapId
} from '../../../../../menu-items/tools/reducers/tools.reducer';
import { Inject } from '@angular/core';
import { AddMeasureAction, RemoveMeasureAction } from '../../../../../menu-items/tools/actions/tools.actions';
import { geometry } from '@turf/helpers';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, VisualizersConfig],
	isHideable: true
})
export class MeasureDistanceVisualizer extends EntitiesVisualizer {
	isTotalMeasureActive: boolean;
	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;
	hoveredMeasureId: string;
	onHiddenStateChanged = new Subject();

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
	protected hoverFeatureStyle = new Style({
		stroke: new Stroke({
			color: this.visualizerStyle.hover.stroke,
			width: this.visualizerStyle.hover['stroke-width']
		})
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

	onInitSubscriptions() {
		super.onInitSubscriptions();
		this.onHiddenStateChanged.next();
	}

	@AutoSubscription
	show$ = () => combineLatest(
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMeasureDataByMapId(this.mapId)),
		this.store$.select(selectIsMeasureToolActive),
		this.onHiddenStateChanged).pipe(
		distinctUntilChanged(),
		filter(([activeMapId, measureData, isMeasureToolActive]) => !this.isHidden && Boolean(measureData)),
		tap(([activeMapId, measureData, isMeasureToolActive]) => {
			if (!measureData.isLayerShowed) {
				this.iMap.removeLayer(this.vector);
			} else {
				if (isMeasureToolActive) {
					this.iMap.addLayer(this.vector);
					this.checkToolActive(measureData.isToolActive);
					this.checkRemoveModeActive(measureData.isRemoveMeasureModeActive);
					if (measureData.forceDisableTranslate) {
						this.removeTranslateMeasuresLabelInteraction();
					}
					else if (measureData.forceDisableTranslate === false) { // don't enter if forceDisableTranslate is undefined
						this.createTranslateMeasuresLabelInteraction();
					}
				}
				else {
					this.removeDrawInteraction();
					this.removeHoverForDeleteInteraction();
					this.removeClickDeleteInteraction();
					this.removeTranslateMeasuresLabelInteraction();
				}
			}
		}),
		switchMap(([activeMapId, measureData, isMeasureToolActive]) => {
			return this.setEntities(measureData.meausres);
		}),
	);

	checkToolActive(isActive: boolean) {
		if (isActive) {
			this.createDrawInteraction();
		}
		else {
			this.removeDrawInteraction();
		}
	}

	checkRemoveModeActive(isActive: boolean) {
		if (isActive) {
			this.createHoverForDeleteInteraction();
			this.createClickDeleteInteraction();
			this.removeTranslateMeasuresLabelInteraction();
		}
		else {
			this.removeClickDeleteInteraction();
			this.removeHoverForDeleteInteraction();
			this.createTranslateMeasuresLabelInteraction();
		}
	}

	setEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		const entitiesToRemove = [];
		this.idToEntity.forEach( (entity, id) => {
			if (entity.feature.getGeometry().getType() === 'LineString' && logicalEntities.every( _entity => _entity.id !== id)) {
				entitiesToRemove.push(entity.originalEntity, ...entity.originalEntity.featureJson.properties.measures)
			}
		});
		const entitiesToDraw = logicalEntities.filter( entity => !this.idToEntity.has(entity.id)).reduce((logicalEntities, entity) => {
			if (!logicalEntities) {
				logicalEntities = []
			}
			logicalEntities.push(entity);
			if (entity.featureJson.properties.measures) {
				logicalEntities.push(...entity.featureJson.properties.measures);
			}
			return logicalEntities;
		}, []);
		entitiesToRemove.forEach( (entity) => this.removeEntity(entity.id));
		return this.addOrUpdateEntities(entitiesToDraw);

	}

	// override base method
	setVisibility(isVisible: boolean) {
		super.setVisibility(isVisible);
		this.onHiddenStateChanged.next();
	}

	createHoverForDeleteInteraction() {
		this.removeHoverForDeleteInteraction();
		const pointerMove = new Select({
			condition: pointerMoveCondition,
			style: this.hoverStyle.bind(this),
			layers: [this.vector],
			filter: this.filterLineStringFeature.bind(this)
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
			condition: clickCondition,
			style: () => new Style({}),
			layers: [this.vector],
			filter: this.filterLineStringFeature.bind(this)
		});
		click.on('select', this.onClickDeleteFeature.bind(this));
		this.addInteraction(VisualizerInteractions.click, click);
	}

	onClickDeleteFeature($event) {
		if ($event.selected.length > 0 && this.hoveredMeasureId === $event.selected[0].getId()) {
			const feature = $event.selected[0];
			const entity = this.getEntity(feature);
			if (entity) {
				this.store$.dispatch(new RemoveMeasureAction({
					mapId: this.mapId,
					measureId: entity.id
				}));
				this.hoveredMeasureId = null;
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
		data.feature.setId(UUID.UUID());
		this.projectionService.projectCollectionAccurately([data.feature], this.iMap.mapObject).pipe(take(1))
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [featureJson] = featureCollection.features;
				const measures = this.createMeasureLabelsFeatures(<GeoJsonLineString>featureJson.geometry, <string>featureJson.id);
				const newEntity: IVisualizerEntity = {
					id: <string>featureJson.id,
					featureJson: {
						...featureJson,
						properties: {
							...featureJson.properties,
							measures: measures.map(measure => ({id: measure.id, featureJson: measure}))
						}
					}
				};
				this.store$.dispatch(
					new AddMeasureAction({
						mapId: this.mapId,
						measure: newEntity
					})
				);
			});
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
		return this.filterLineStringFeature(feature) ? this.measurementMainStyle() : feature.get('measureStyle');
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
		const styles = [this.hoverFeatureStyle];
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

	private createMeasureLabelsFeatures(linestring: GeoJsonLineString, featureId: string) {
		// @TODO: try to make this and getMeasureTextStyle one function
		const features = [];
		const length = linestring.coordinates.length;
		if (length > 2) {
			linestring.coordinates.forEach( (point, index, coordinates) => {
				if (coordinates[index + 1]) {
					const pointA = this.createGeometryPoint(point);
					const pointB = this.createGeometryPoint(coordinates[index + 1]);
					const segment = this.createGeometryLineString(pointA, pointB);
					const centroid = getPointByGeometry(segment);
					const segmentLengthText = this.measureAccurateLength(segment);
					const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();
					singlePointLengthTextStyle.setText(segmentLengthText);
					const labelFeature = this.createLabelFeature(centroid.coordinates, singlePointLengthTextStyle);
					features.push(labelFeature);
				}
			});
		}

		if (this.isTotalMeasureActive || length === 2) {
			// all line string
			const allLengthText = this.measureAccurateLength(linestring);
			const allLengthTextStyle = this.allLengthTextStyle.clone();
			allLengthTextStyle.setText(allLengthText);
			const centroid = getPointByGeometry(linestring);
			const labelFeature = this.createLabelFeature(centroid.coordinates, allLengthTextStyle);
			features.push(labelFeature);
		}
		features.forEach(feature => feature.setId(UUID.UUID()));
		features.forEach(feature => feature.set('feature' , featureId));
		return features.map( feature => this.geoJsonFormat.writeFeatureObject(feature));
	}

	createTranslateMeasuresLabelInteraction() {
		this.removeTranslateMeasuresLabelInteraction();
		const select = new Select({
			condition: (event) => pointerMoveCondition(event) && !event.dragging,
			layers: [this.vector],
			style: (feature) => feature.get('measureStyle'),
			filter: (feature) => !this.filterLineStringFeature(feature)
		});
		const translate = new Translate({
			features: select.getFeatures()
		});
		this.addInteraction(VisualizerInteractions.selectMeasureLabelHandler, select);
		this.addInteraction(VisualizerInteractions.translateInteractionHandler, translate);
	}
	removeTranslateMeasuresLabelInteraction() {
		this.removeInteraction(VisualizerInteractions.selectMeasureLabelHandler);
		this.removeInteraction(VisualizerInteractions.translateInteractionHandler);
	}
	/**
	 * Format length output.
	 * @param line The line.
	 * @param projection The Projection.
	 */
	measureApproximateLength(line, projection): string {
		const length = getLength(line, { projection: projection });
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

	measureAccurateLength(line: GeoJsonLineString): string {
		const length = line.coordinates
			.map( (segment, index, arr) => arr[index + 1] && [this.createGeometryPoint(segment), this.createGeometryPoint(arr[index + 1])] )
			.filter(Boolean)
			.reduce( (length, segment) => {
				return length + calculateLineDistance(segment[0], segment[1]);
			}, 0);
		if (length < 1) {
			return `${(length * 1000).toFixed(2)}  m`;
		}
		return `${length.toFixed(2)}  km`;
	}

	onDispose(): void {
		this.removeTranslateMeasuresLabelInteraction();
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
		this.removeInteraction(VisualizerInteractions.pointerMove);
		this.removeInteraction(VisualizerInteractions.click);
		super.onDispose();
	}

	private filterLineStringFeature(feature) {
		return feature.getGeometry().getType() === 'LineString';
	}

	private createGeometryPoint(coordinates: number[]): GeoJsonPoint {
		return <GeoJsonPoint>geometry('Point', coordinates);
	}

	private createGeometryLineString(pointA: GeoJsonPoint, pointB: GeoJsonPoint): GeoJsonLineString {
		return <GeoJsonLineString>geometry('LineString', [pointA.coordinates, pointB.coordinates]);
	}

	private createLabelFeature(coordinates, length) {
		const labelFeature = new Feature(new Point(<[number, number]>coordinates));
		const featureStyle = new Style({text: length});
		labelFeature.setStyle(featureStyle);
		labelFeature.set('measureStyle', featureStyle);
		return labelFeature;
	}
}

