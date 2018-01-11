import { EntitiesVisualizer } from './entities-visualizer';
import Draw from 'ol/interaction/draw';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Select from 'ol/interaction/select';
import Fill from 'ol/style/fill';
import color from 'ol/color';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import GeomPolygon from 'ol/geom/polygon';
import OLFeature from 'ol/feature';
import OLGeoJSON from 'ol/format/geojson';
import { VisualizerStateStyle } from './models/visualizer-state';
import { AnnotationsContextMenuEvent } from '@ansyn/core/models/visualizers/annotations.model';
import { VisualizerEvents, VisualizerInteractions } from '@ansyn/imagery/model/imap-visualizer';
import { AnnotationMode } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Feature } from 'geojson';
import { cloneDeep } from 'lodash';

export const AnnotationVisualizerType = 'AnnotationVisualizer';

export class AnnotationsVisualizer extends EntitiesVisualizer {
	static type = AnnotationVisualizerType;
	isHideable = true;
	public geoJsonFormat: OLGeoJSON = new OLGeoJSON();
	public namePrefix = 'Annotate-';

	get drawEndPublisher() {
		return this.events.get(VisualizerEvents.drawEndPublisher);
	}

	get contextMenuHandler() {
		return this.events.get(VisualizerEvents.contextMenuHandler);
	}

	get drawInteractionHandler() {
		return this.interactions.get(VisualizerInteractions.drawInteractionHandler);
	}

	constructor(style?: Partial<VisualizerStateStyle>) {
		super(AnnotationVisualizerType, style, {
			initial: {
				stroke: {
					color: '#27b2cfe6',
					width: 1
				},
				fill: {
					color: '#FFFFFF'
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

	protected resetEvents(): void {
		this.removeEvent(VisualizerEvents.drawEndPublisher);
		this.removeEvent(VisualizerEvents.contextMenuHandler);
		this.addEvent(VisualizerEvents.drawEndPublisher);
		this.addEvent(VisualizerEvents.contextMenuHandler);
	}

	createContextMenuInteraction() {
		const condition = (event) => event.originalEvent.which === 3 && event.type === 'pointerdown';
		const contextMenuInteraction = new Select({
			condition,
			layers: [this.vector],
			hitTolerance: 10
		});
		contextMenuInteraction.on('select', this.onSelectFeature.bind(this));
		return contextMenuInteraction;
	}

	onSelectFeature(data) {
		const originalEventTarget = data.mapBrowserEvent.originalEvent.target;
		data.target.getFeatures().clear();
		const [selectedFeature] = data.selected;
		let pixels = this.getFeaturePositionInPixels({ selectedFeature, originalEventTarget });
		const { id } = selectedFeature.getProperties();
		const contextMenuEvent: AnnotationsContextMenuEvent = {
			featureId: id,
			pixels
		};
		const callback = event => {
			event.stopPropagation();
			event.preventDefault();
			originalEventTarget.removeEventListener('contextmenu', callback);
			this.contextMenuHandler.emit(contextMenuEvent);
		};
		originalEventTarget.addEventListener('contextmenu', callback);
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
		const { style, geometryName } = selectedFeature.getProperties();
		const mainExtent = selectedFeature.getGeometry().getExtent();
		const mainLine = this.getExtentAsPixels(mainExtent).map(pair => pair.map(Math.round));
		const arrowStyles = this.arrowStyle(selectedFeature, style);

		const line1Extent = arrowStyles[1].getGeometry().getExtent();
		const line1 = this.getExtentAsPixels(line1Extent).map(pair => pair.map(Math.round));

		const line2Extent = arrowStyles[2].getGeometry().getExtent();
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

	getFeaturePositionInPixels({ selectedFeature, originalEventTarget }) {
		const boundingRect = originalEventTarget.getBoundingClientRect();
		const { geometryName } = selectedFeature.getProperties();
		let pixels;

		if (geometryName === 'Annotate-Arrow') {
			pixels = this.arrowLinesToPixels(selectedFeature);
			pixels.top += boundingRect.top;
			pixels.left += boundingRect.left;
		} else {
			const extent = selectedFeature.getGeometry().getExtent();
			pixels = this.getExtentAsPixels(extent);
			pixels = {
				left: pixels[0][0] + boundingRect.left,
				top: pixels[1][1] + boundingRect.top,
				width: pixels[1][0] - pixels[0][0],
				height: pixels[0][1] - pixels[1][1]
			};
		}
		return pixels;
	}

	getExtentAsPixels(extent) {
		return [this.iMap.mapObject.getPixelFromCoordinate([extent[0], extent[1]]),
			this.iMap.mapObject.getPixelFromCoordinate([extent[2], extent[3]])
		];
	}

	onDrawEndEvent({ feature }) {

		this.removeDrawInteraction();
		const geometry = feature.getGeometry();
		const geometryName = feature.getGeometryName();
		const featureProjection = this.iMap.mapObject.getView().getProjection();
		let cloneGeometry = <any> geometry.clone();

		if (cloneGeometry instanceof GeomCircle) {
			cloneGeometry = <any> GeomPolygon.fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: Date.now(),
			style: cloneDeep (this.visualizerStyle.initial),
			geometryName
		});

		const geoJsonFeature = <Feature<any>> this.geoJsonFormat.writeFeatureObject(feature, {
			featureProjection,
			dataProjection: 'EPSG:4326'
		});

		this.drawEndPublisher.emit(geoJsonFeature);
	}

	removeDrawInteraction() {
		this.removeInteraction(VisualizerInteractions.drawInteractionHandler);
	}

	toggleDrawInteraction(type: AnnotationMode) {
		const currentGeometryName = this.drawInteractionHandler && (<any> this.drawInteractionHandler).geometryName_;
		const geometryName = `${this.namePrefix}${type}`;
		this.removeDrawInteraction();

		if (!type || currentGeometryName === geometryName) {
			return;
		}

		const drawInteractionHandler = new Draw({
			type: type === 'Rectangle' ? 'Circle' : type === 'Arrow' ? 'LineString' : type,
			geometryFunction: type === 'Rectangle' ? (<any>Draw).createBox(4) : undefined,
			geometryName,
			condition: (event) => event.originalEvent.which === 1,
			style: (feature) => this.getStyleObj(feature, this.visualizerStyle.initial, geometryName)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	arrowStyle(feature, style) {
		const geometry = feature.getGeometry();
		const stroke = new Stroke(style.stroke);
		const styles = [new Style({ stroke })];
		const cordinates = geometry.getCoordinates();
		const start = cordinates[cordinates.length - 2];
		const end = cordinates[cordinates.length - 1];
		const dx = end[0] - start[0];
		const dy = end[1] - start[1];
		const rotation = Math.atan2(dy, dx);
		const lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		const factor = lineLength * 0.1;

		if (!isNaN(rotation) && !isNaN(factor) && !isNaN(lineLength)) {
			const lineStr1 = new LineString([end, [end[0] - factor, end[1] + factor]]);
			lineStr1.rotate(rotation, end);
			styles.push(new Style({
				geometry: lineStr1,
				stroke
			}));
			const lineStr2 = new LineString([end, [end[0] - factor, end[1] - factor]]);
			lineStr2.rotate(rotation, end);
			styles.push(new Style({
				geometry: lineStr2,
				stroke
			}));
		} else {
			return feature.getStyle();
		}

		return styles;
	}

	getStyleObj(feature, style, geometryName) {
		const fillColor = style.fill.color;
		const newFill = color.asArray(fillColor).slice();
		newFill[3] = 0.4;
		const fill = new Fill({ color: newFill });

		if (feature.getGeometry() instanceof LineString && geometryName === `${this.namePrefix}Arrow`) {
			return this.arrowStyle(feature, style);
		}

		return new Style({
			stroke: new Stroke(style.stroke),
			fill,
			image: new Circle({
				radius: style.point.radius,
				fill,
				stroke: new Stroke({
					color: style.stroke.color,
					width: style.point.radius / 2
				})
			})
		});
	}

	featureStyle(feature: OLFeature) {
		const { style, geometryName } = feature.getProperties();
		return this.getStyleObj(feature, style, geometryName);
	}

}
