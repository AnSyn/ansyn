import { EntitiesVisualizer, VisualizerStates } from '../entities-visualizer';
import Feature from 'ol/feature';
import Draw from 'ol/interaction/draw';
import proj from 'ol/proj';
import Text from 'ol/style/text';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Circle from 'ol/style/circle';
import Point from 'ol/geom/point';
import MultiPoint from 'ol/geom/multipoint';
import LineString from 'ol/geom/linestring';
import VectorSource from 'ol/source/vector';
import Sphere from 'ol/sphere';
import GeoJSON from 'ol/format/geojson';
import { UUID } from 'angular2-uuid';
import { VisualizerStateStyle } from '../models/visualizer-state';
import { IVisualizerEntity } from '@ansyn/imagery/model';
import { getPointByGeometry } from '@ansyn/core/utils';
import { VisualizerInteractions } from '@ansyn/imagery/model/imap-visualizer';
import { FeatureCollection, GeometryObject } from 'geojson';
import { Observable } from 'rxjs/Observable';

export const MeasureDistanceVisualizerType = 'MeasureDistanceVisualizer';

export class MeasureDistanceVisualizer extends EntitiesVisualizer {
	static type = MeasureDistanceVisualizerType;

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

	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	getSinglePointLengthTextStyle(): Text {
		return new Text({
			font: '14px Calibri,sans-serif',
			fill: new Fill({
				color: '#FFFFFF'
			}),
			stroke: new Stroke({
				color: '#3399CC',
				width: 3
			}),
			offsetY: 30
		});
	}

	constructor(style: Partial<VisualizerStateStyle>) {
		super(MeasureDistanceVisualizerType, style, {
			initial: {
				stroke: {
					color: '#3399CC',
					width: 2
				},
				fill: {
					color: '#FFFFFF'
				},
				point: {
					radius: 4
				},
				line: {
					width: 2
				},
				zIndex: 5
			}
		});

		this.geoJsonFormat = new GeoJSON();
	}

	onResetView(): Observable<boolean> {
		return super.onResetView()
			.filter(result => result === true)
			.do(() => {
				if (this.drawInteractionHandler) {
					this.createInteraction();
				}
			});
	}

	clearInteractionAndEntities() {
		this.removeDrawInteraction();
		this.clearEntities();
	}

	createInteraction(type = 'LineString') {
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
		this.iMap.projectionService.projectCollectionAccurately([data.feature], this.iMap)
			.subscribe((featureCollection: FeatureCollection<GeometryObject>) => {
				const [featureJson] = featureCollection.features;
				const newEntity: IVisualizerEntity = {
					id: UUID.UUID(),
					featureJson
				};
				this.addOrUpdateEntities([newEntity]).subscribe();
			});
	}

	// override base entities visualizer style
	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		const styles = this.mainStyle(feature);
		const measureStyles = this.getMeasureTextStyle(feature, true);
		measureStyles.forEach((style) => {
			styles.push(style);
		});
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
		const styles = [new Style({ stroke: new Stroke(this.visualizerStyle.initial.stroke) })];
		// Points
		const pointsStyle = new Style({
			image: new Circle({
				radius: 5,
				stroke: new Stroke(this.visualizerStyle.initial.stroke),
				fill: new Fill(this.visualizerStyle.initial.fill)
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
		const geometry = <LineString> feature.getGeometry();

		if (geometry.getType() === 'Point') {
			return styles;
		}
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();

		// all line string
		const allLengthText = this.formatLength(geometry, projection);
		this.allLengthTextStyle.setText(allLengthText);
		let allLinePoint = new Point(geometry.getCoordinates()[0]);

		if (calculateCenterOfMass) {
			const featureId = <string> feature.getId();
			const entityMap = this.idToEntity.get(featureId);
			if (entityMap) {
				const featureGeoJson = <any> this.geoJsonFormat.writeFeatureObject(entityMap.feature);
				const centroid = getPointByGeometry(featureGeoJson.geometry);
				allLinePoint = new Point(<[number, number]> centroid.coordinates);
			}
		}

		// text points
		const length = geometry.getCoordinates().length;
		if (length > 2) {
			geometry.forEachSegment((start, end) => {
				const lineString = new LineString([start, end]);
				const segmentLengthText = this.formatLength(lineString, projection);
				const singlePointLengthTextStyle = this.getSinglePointLengthTextStyle();
				singlePointLengthTextStyle.setText(segmentLengthText);
				styles.push(new Style({
					geometry: new Point(end),
					text: singlePointLengthTextStyle
				}));
			});
		}

		styles.push(new Style({
			geometry: allLinePoint,
			text: this.allLengthTextStyle
		}));
		return styles;
	}

	/**
	 * Format length output.
	 * @param {ol.geom.LineString} line The line.
	 * @return {string} The formatted length.
	 */
	formatLength(line, projection) {
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
