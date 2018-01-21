import { EntitiesVisualizer } from './entities-visualizer';
import Draw from 'ol/interaction/draw';
import Select from 'ol/interaction/select';
import color from 'ol/color';
import olExtent from 'ol/extent';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import MultiLineString from 'ol/geom/multilinestring';
import GeomPolygon from 'ol/geom/polygon';
import olPolygon from 'ol/geom/polygon';
import OLFeature from 'ol/feature';
import OLGeoJSON from 'ol/format/geojson';
import VectorLayer from 'ol/layer/vector';
import SourceVector from 'ol/source/vector';
import condition from 'ol/events/condition';
import Style from 'ol/style/style';
import { VisualizerEvents, VisualizerInteractions } from '@ansyn/imagery/model/imap-visualizer';
import { Feature } from 'geojson';
import { cloneDeep } from 'lodash';
import { VisualizerStateStyle } from './models/visualizer-state';
import { AnnotationMode, AnnotationsContextMenuBoundingRect } from '@ansyn/core/models/visualizers/annotations.model';
import { AnnotationsContextMenuEvent } from '@ansyn/core';
import { toDegrees } from '@ansyn/core/utils/math';

export const AnnotationVisualizerType = 'AnnotationVisualizer';

export class AnnotationsVisualizer extends EntitiesVisualizer {
	static type = AnnotationVisualizerType;
	static fillAlpha = 0.4;
	isHideable = true;
	disableCache = true;
	public geoJsonFormat: OLGeoJSON = new OLGeoJSON();
	public mode: AnnotationMode;

	contextMenuSource = new SourceVector();

	contextMenuLayer = new VectorLayer({
		source: this.contextMenuSource
	});

	get mapRotation(): number {
		return this.iMap.mapObject.getView().getRotation();
	}

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
			// style:  this.featureStyle.bind(this),
			hitTolerance: 10
		});
		contextMenuInteraction.on('select', this.onSelectFeature.bind(this));

		return contextMenuInteraction;
	}

	initLayers() {
		super.initLayers();
		this.iMap.mapObject.addLayer(this.contextMenuLayer);
	}

	onSelectFeature(data) {
		const originalEventTarget = data.mapBrowserEvent.originalEvent.target;
		data.target.getFeatures().clear();
		const [selectedFeature] = data.selected;
		const boundingRect = this.getFeatureBoundingRect(selectedFeature);
		const { id } = selectedFeature.getProperties();
		const contextMenuEvent: AnnotationsContextMenuEvent = {
			featureId: id,
			boundingRect
		};
		const callback = event => {
			event.stopPropagation();
			event.preventDefault();
			originalEventTarget.removeEventListener('contextmenu', callback);
			this.contextMenuHandler.emit(contextMenuEvent);
		};
		originalEventTarget.addEventListener('contextmenu', callback);
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
		const  [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = this.getExtentAsPixels(extent);
		const width = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
		const height = Math.sqrt(Math.pow(y2 - y3, 2) + Math.pow(x2 - x3, 2));
		return { left: x4 , top: y4 , width, height, rotation };
	}

	getExtentAsPixels([x1, y1, x2, y2]) {
		const bottomLeft = this.iMap.mapObject.getPixelFromCoordinate([x1, y1]);
		const bottomRight = this.iMap.mapObject.getPixelFromCoordinate([x2, y1]);
		const topRight = this.iMap.mapObject.getPixelFromCoordinate([x2, y2]);
		const topLeft = this.iMap.mapObject.getPixelFromCoordinate([x1, y2]);
		return [bottomLeft, bottomRight, topRight, topLeft];
	}

	onDrawEndEvent({ feature }) {

		this.removeDrawInteraction();
		const geometry = feature.getGeometry();
		const featureProjection = this.iMap.mapObject.getView().getProjection();
		let cloneGeometry = <any> geometry.clone();

		if (cloneGeometry instanceof GeomCircle) {
			cloneGeometry = <any> GeomPolygon.fromCircle(<any>cloneGeometry);
		}

		feature.setGeometry(cloneGeometry);

		feature.setProperties({
			id: Date.now(),
			style: cloneDeep(this.visualizerStyle)
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

	toggleDrawInteraction(mode: AnnotationMode) {
		this.mode = mode === this.mode ? undefined : mode;
		this.removeDrawInteraction();

		if (!this.mode) {
			return;
		}

		const drawInteractionHandler = new Draw({
			type: mode === 'Rectangle' ? 'Circle' : mode === 'Arrow' ? 'LineString' : mode,
			geometryFunction: mode === 'Rectangle' ? (<any>Draw).createBox(4) : mode === 'Arrow' ? this.arrowGeometryFunction : undefined,
			condition: (event) => event.originalEvent.which === 1,
			style: (feature) => this.featureStyle(feature)
		});

		drawInteractionHandler.on('drawend', this.onDrawEndEvent.bind(this));
		this.addInteraction(VisualizerInteractions.drawInteractionHandler, drawInteractionHandler);
	}

	arrowGeometryFunction(coordinates, opt_geometry) {
		let geometry = opt_geometry;
		if (opt_geometry) {
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


}
