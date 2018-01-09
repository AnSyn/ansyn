import { EntitiesVisualizer, VisualizerStates } from './entities-visualizer';
import Draw from 'ol/interaction/draw';
import VectorLayer from 'ol/layer/vector';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Select from 'ol/interaction/select';
import Fill from 'ol/style/fill';
import color from 'ol/color';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import GeomPolygon from 'ol/geom/polygon';
import Feature from 'ol/feature';
import OLGeoJSON from 'ol/format/geojson';
import condition from 'ol/events/condition';
import { featureCollection } from '@turf/helpers';
import { VisualizerStateStyle } from './models/visualizer-state';
import { EventEmitter } from '@angular/core';
import { AnnotationsContextMenuEvent } from '@ansyn/core/models/visualizers/annotations.model';
import { VisualizerEvents } from '@ansyn/imagery/model/imap-visualizer';
import { IVisualizerEntity } from '@ansyn/imagery/index';
import { AnnotationMode } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { VisualizerInteractions } from '@ansyn/imagery/model/imap-visualizer';

export const AnnotationVisualizerType = 'AnnotationVisualizer';

export class AnnotationsVisualizer extends EntitiesVisualizer {
	static type = AnnotationVisualizerType;
	isHideable = true;
	public drawInteractionHandler: Draw;
	public geoJsonFormat: OLGeoJSON;
	public features: Array<any>;
	public namePrefix = 'Annotate-';
	public data;

	get drawEndPublisher() {
		return this.events.get(VisualizerEvents.drawEndPublisher);
	}

	get contextMenuHandler() {
		return this.events.get(VisualizerEvents.contextMenuHandler);
	}

	constructor(style?: Partial<VisualizerStateStyle>) {
		super(AnnotationVisualizerType, style, {
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
				}
			}
		});

		this.geoJsonFormat = new OLGeoJSON();
		this.features = [];
		this.events.set(VisualizerEvents.drawEndPublisher, new EventEmitter<any>());
		this.events.set(VisualizerEvents.contextMenuHandler, new EventEmitter<any>());
	}

	protected resetInteractions(): void {
		const contextMenu = new Select({
			condition: event => event.originalEvent.which === 3 && event.type === 'pointerdown',
			layers: [this.vector]
		});
		contextMenu.on('select', this.onSelectFeatur.bind(this));
		this.addInteraction(VisualizerInteractions.contextMenu, contextMenu);
	}

	onSelectFeatur(data) {

		const target = data.mapBrowserEvent.originalEvent.target;
		data.target.getFeatures().clear();
		const selectedFeature = data.selected.shift();
		const boundingRect = target.getBoundingClientRect();
		let pixels;

		if (selectedFeature.geometryName_ === 'Annotate-Arrow') {
			pixels = this.arrowLinesToPixels(selectedFeature);
			pixels.top += boundingRect.top;
			pixels.left += boundingRect.left;
		} else {
			pixels = this.getFeaturePositionInPixels(selectedFeature);
			pixels = {
				left: pixels[0][0] + boundingRect.left,
				top: pixels[1][1] + boundingRect.top,
				width: pixels[1][0] - pixels[0][0],
				height: pixels[0][1] - pixels[1][1]
			};
		}
		const { id, geometryName } = selectedFeature.getProperties();

		const contextMenuEvent: AnnotationsContextMenuEvent = {
			featureId: id,
			geometryName,
			pixels
		};

		this.contextMenuHandler.emit(contextMenuEvent);
		const callback = event => {
			event.stopPropagation();
			event.preventDefault();
			target.removeEventListener('contextmenu', callback);
		};
		target.addEventListener('contextmenu', callback);
	}

	getGeoJson() {
		return JSON.stringify(this.getFeatures());
	}

	getFeatures(): any {
		return featureCollection(this.features);
	}

	changeStroke(color) {
		this.updateStyle({ initial: { stroke: { color } } });
	}

	changeFill(color) {
		this.updateStyle({ initial: { fill: { color } } });
	}

	changeLine(width) {
		this.updateStyle({ initial: { stroke: { width } } });
	}

	arrowLinesToPixels(selectedFeature) {
		const mainExtent = selectedFeature.getGeometry().getExtent();
		const mainLine = this.getExtentAsPixels(mainExtent).map(pair => pair.map(Math.round));

		const line1Extent = selectedFeature.getStyle()[1].getGeometry().getExtent();
		const line1 = this.getExtentAsPixels(line1Extent).map(pair => pair.map(Math.round));

		const line2Extent = selectedFeature.getStyle()[2].getGeometry().getExtent();
		const line2 = this.getExtentAsPixels(line2Extent).map(pair => pair.map(Math.round));

		const points = mainLine.concat(line1).concat(line2);
		let width = 0, height = 0, top = Infinity, left = Infinity;

		points.forEach(point1 => {
			if (point1[0] < left) {
				left = point1[0];
			}

			if (point1[1] < top) {
				top = point1[1];
			}

			points.forEach(point2 => {
				const horizontal = Math.abs(point1[0] - point2[0]);
				if (horizontal > width) {
					width = horizontal;
				}

				const vertical = Math.abs(point1[1] - point2[1]);
				if (vertical > height) {
					height = vertical;
				}
			});
		});

		return { top, left, width, height };
	}

	getFeaturePositionInPixels(feature) {
		const geometry = feature.getGeometry();
		const extent = geometry.getExtent();
		return this.getExtentAsPixels(extent); // [bottomLeft, topRight];
	}

	getExtentAsPixels(extent) {
		return [this.iMap.mapObject.getPixelFromCoordinate([extent[0], extent[1]]),
			this.iMap.mapObject.getPixelFromCoordinate([extent[2], extent[3]])
		];
	}

	annotationsLayerToEntities(annotationsLayer: string): IVisualizerEntity[] {
		let parsedAnnotationLayer: any;
		if (!annotationsLayer) {
			return [];
		}
		if (typeof annotationsLayer === 'string') {
			parsedAnnotationLayer = JSON.parse(annotationsLayer);
		}
		return parsedAnnotationLayer.features.map((featureStr: string) => ({
			id: JSON.parse(featureStr).properties.id,
			featureJson: JSON.parse(featureStr)
		}));
	}

	onDrawEndEvent({ feature }) {

		this.removeDrawInteraction();
		const geometry = feature.getGeometry();
		const geometryName = feature.getGeometryName();
		const featureProjection = this.iMap.mapObject.getView().getProjection();
		let cloneGeometry = <any> geometry.clone(); // .transform(featureProjection, 'EPSG:4326');

		if (cloneGeometry instanceof GeomCircle) {
			cloneGeometry = <any> GeomPolygon.fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: Date.now(),
			style: this.visualizerStyle.initial,
			geometryName,
			data: {}
		});

		const geoJsonSingleFeature = this.geoJsonFormat.writeFeature(feature, {
			featureProjection,
			dataProjection: 'EPSG:4326'
		});

		this.features.push(geoJsonSingleFeature);
		this.drawEndPublisher.emit(featureCollection(this.features));
	}

	removeDrawInteraction() {
		if (this.drawInteractionHandler) {
			this.iMap.mapObject.removeInteraction(this.drawInteractionHandler);
			this.drawInteractionHandler = undefined;
		}
	}

	toggleDrawInteraction(type: AnnotationMode) {
		const currentGeometryName = this.drawInteractionHandler && (<any> this.drawInteractionHandler).geometryName_;
		const geometryName = `${this.namePrefix}${type}`;
		this.removeDrawInteraction();

		if (currentGeometryName === geometryName) {
			return;
		}

		this.drawInteractionHandler = new Draw({
			type: type === 'Rectangle' ? 'Circle' : type === 'Arrow' ? 'LineString' : type,
			geometryFunction: type === 'Rectangle' ? (<any>Draw).createBox(4) : undefined,
			geometryName
		});

		this.drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		(<any>this.iMap.mapObject).addInteraction(this.drawInteractionHandler);
	}

	arrowStyle(feature) {
		const geometry = feature.getGeometry();
		const styles = [new Style({ stroke: new Stroke(this.visualizerStyle.initial.stroke) })];
		const cordinates = geometry.getCoordinates();
		const start = cordinates[cordinates.length - 2];
		const end = cordinates[cordinates.length - 1];
		const dx = end[0] - start[0];
		const dy = end[1] - start[1];
		const rotation = Math.atan2(dy, dx);
		const lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		const factor = lineLength * 0.1;
		const lineStr1 = new LineString([end, [end[0] - factor, end[1] + factor]]);
		lineStr1.rotate(rotation, end);
		const lineStr2 = new LineString([end, [end[0] - factor, end[1] - factor]]);
		lineStr2.rotate(rotation, end);

		const stroke = new Stroke(this.visualizerStyle.initial.stroke);

		styles.push(new Style({
			geometry: lineStr1,
			stroke: stroke
		}));
		styles.push(new Style({
			geometry: lineStr2,
			stroke: stroke
		}));


		return styles;
	}

	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		const { style, geometryName } = feature.getProperties();
		const fillColor = style.fill.color;
		const newFill = color.asArray(fillColor).slice();
		newFill[3] = 0.4;
		const fill = new Fill({ color: newFill });

		if (geometryName === `${this.namePrefix}Arrow`) {
			return this.arrowStyle(feature);
		}

		if (geometryName === `${this.namePrefix}Point`) {
			return new Style({
				image: new Circle({
					radius: style.point.radius,
					fill,
					stroke: new Stroke({
						color: style.stroke.color,
						width: style.point.radius / 2
					})
				}),
				zIndex: Infinity
			});
		}

		return new Style({
			stroke: new Stroke(style.stroke),
			fill
		});
	}

}
