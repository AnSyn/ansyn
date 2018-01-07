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

export const MeasureDistanceVisualizerType = 'MeasureDistanceVisualizer';

export class MeasureDistanceVisualizer extends EntitiesVisualizer {
	static type = MeasureDistanceVisualizerType;

	protected allLengthTextStyle = new Text({
		font: "16px Calibri,sans-serif",
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
			color: 'rgba(0, 0, 0, 0.5)',
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

	interactionHandler: Draw;
	geoJsonFormat: GeoJSON;
	interactionSource: VectorSource;

	getSinglePointLengthTextStyle(): Text {
		return new Text({
			font: "14px Calibri,sans-serif",
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

	onResetView() {
		super.onResetView();
		if (this.interactionHandler) {
			this.createInteraction();
		}
	}

	clearInteractionAndEntities() {
		this.removeInteraction();
		this.clearEntities();
	}

	createInteraction(type = 'LineString') {
		this.removeInteraction();

		this.interactionSource = new VectorSource({ wrapX: false });

		this.interactionHandler = new Draw({
			source: this.interactionSource,
			type: type,
			geometryName: `Measure_' + ${type}`,
			style: this.drawFeatureStyle.bind(this)
		});

		this.addInteraction();
	}

	addInteraction() {
		if (this.interactionHandler) {
			this.interactionHandler.on('drawend', this.onDrawEndEvent.bind(this));
			this.iMap.mapObject.addInteraction(this.interactionHandler);
		}
	}

	removeInteraction() {
		if (this.interactionHandler) {
			this.iMap.mapObject.removeInteraction(this.interactionHandler);
		}
	}

	onDrawEndEvent(data) {
		const view = (<any>this.iMap.mapObject).getView();
		const projection = view.getProjection();
		let geoJsonSingleFeature = this.geoJsonFormat.writeFeature(data.feature, {
			featureProjection: projection.getCode(),
			dataProjection: 'EPSG:4326',
		});
		const newEntity: IVisualizerEntity = {
			id: UUID.UUID(),
			featureJson: JSON.parse(geoJsonSingleFeature)
		};
		this.addOrUpdateEntities([newEntity])
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
			geometry: function(feature) {
				// return the coordinates of the first ring of the polygon
				const coordinates = feature.getGeometry().getCoordinates();
				return new MultiPoint(coordinates);
			}
		});
		styles.push(pointsStyle);
		return styles;
	}

	// points string styles
	getMeasureTextStyle(feature: Feature, calculateCenterOfMass = false) {
		const styles = [];
		const geometry = feature.getGeometry();

		if (geometry.getType() === "Point") {
			return styles;
		}

		// all line string
		const allLengthText = this.formatLength(geometry);
		this.allLengthTextStyle.setText(allLengthText);
		let allLinePoint = new Point(geometry.getCoordinates()[0]);
		if (calculateCenterOfMass) {
			const featureId = feature.getId();
			const entityMap = this.idToEntity.get(featureId);
			if (entityMap) {
				const view = (<any>this.iMap.mapObject).getView();
				const projection = view.getProjection();
				const lonLat = getPointByGeometry(entityMap.originalEntity.featureJson.geometry);
				const lonLatCords = proj.fromLonLat(lonLat.coordinates, projection);
				allLinePoint = new Point(lonLatCords);
			}
		}

		// text points
		const length = geometry.getCoordinates().length;
		if (length > 2) {
			geometry.forEachSegment((start, end) => {
				const lineString = new LineString([start, end]);
				const segmentLengthText = this.formatLength(lineString);
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
	formatLength(line) {
		const length = Sphere.getLength(line);
		let output;
		if (length > 100) {
			output = (Math.round(length / 1000 * 100) / 100) +
				' ' + 'km';
		} else {
			output = (Math.round(length * 100) / 100) +
				' ' + 'm';
		}
		return output;
	};
}
