import { EntitiesVisualizer } from './entities-visualizer';
import { IMap } from '../imagery/model/imap';
import Draw from 'ol/interaction/draw';
import VectorSource from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Select from 'ol/interaction/select';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import GeoJSON from 'ol/format/geojson';
import { featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { Subject } from 'rxjs/Subject';
import { VisualizerStateStyle } from './models/visualizer-state';


export const AnnotationVisualizerType = 'AnnotationVisualizer';


enum MouseClick {
	Left = 1,
	Scroll = 2,
	Right = 3
}

export class AnnotationsVisualizer extends EntitiesVisualizer {
	static type = AnnotationVisualizerType;

	public source: VectorSource;
	public layer: VectorLayer;

	public interactionHandler: Draw;
	public selectInteraction: Select;
	public currentInteraction;
	public geoJsonFormat: GeoJSON;
	public features: Array<any>;
	public collection: FeatureCollection<any>;
	public fill;
	public namePrefix = 'Annotate-';
	public data;

	constructor(style?: Partial<VisualizerStateStyle>) {
		super(AnnotationVisualizerType, style, {
			initial: {
				stroke: {
					color: '#3399CC',
					width: 2
				},
				fill: {
					color: 'rgba(255,255,255,0.4)'
				},
				point: {
					radius: 4
				},
				line: {
					width: 2
				}
			}
		});

		this.geoJsonFormat = new GeoJSON();
		this.features = [];
		this.fill = true;

		this.events.set('drawEndPublisher', new Subject());
		this.events.set('annotationContextMenuHandler', new Subject());
	}

	onInit(mapId: string, map: IMap) {
		this.iMap = map;
		this.mapId = mapId;
	}

	onResetView() {
		this.addLayer();
		this.redrawFromGeoJson();
	}

	getGeoJson() {
		return JSON.stringify(this.getFeatures());
	}

	getFeatures() {
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

	removeLayer() {
		this.iMap.removeLayer(this.layer);
		this.layer = undefined;
	}

	addLayer(id = AnnotationsVisualizer.type) {
		const layer = new VectorLayer();
		// if id is empty then set the current type name as id
		layer.set('id', id);
		this.layer = this.iMap.addLayerIfNotExist(layer);

		this.source = new VectorSource({ wrapX: false });
		this.layer.setSource(this.source);
		this.layer.setStyle(this.styleFunction.bind(this));
		this.layer.setZIndex(200000);

		this.selectInteraction = new Select({
			// event.originalEvent.which === 3 &&
			condition: event => event.originalEvent.which === MouseClick.Right && event.type === 'pointerdown',
			layers: [this.layer]
		});

		this.selectInteraction.on('select', data => {
				console.log(data.mapBrowserEvent.originalEvent.which);
				const target = data.mapBrowserEvent.originalEvent.target;
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

				const callback = event => {
					event.stopPropagation();
					event.preventDefault();
					data.target.getFeatures().clear();
					this.events.get('annotationContextMenuHandler').next({
						action: 'openMenu',
						feature: selectedFeature,
						pixels
					});
					target.removeEventListener('contextmenu', callback);
				};

				target.addEventListener('contextmenu', callback);
			}
		);
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
			this.iMap.mapObject.getPixelFromCoordinate([extent[2], extent[3]])];
	}

	addSelectInteraction() {
		if (!this.layer) {
			return;
		}

		this.removeSelectInteraction();
		this.iMap.mapObject.addInteraction(this.selectInteraction);

	}

	removeSelectInteraction() {
		this.iMap.mapObject.removeInteraction(this.selectInteraction);
	}

	redrawFromGeoJson() {
		// const geoFeatures = this.collection;
		this.source.clear();
		this.collection = undefined;
		const features = this.createFeturesFromGeoJson(this.features);
		this.source.addFeatures(features);
	}

	drawFeatures(data) {
		if (data === undefined || this.source === undefined) {
			return;
		}

		if (typeof data === 'string') {
			data = JSON.parse(data);
		}


		// readFeatures throw an exceptions so I am using this method
		this.features = data.features;
		const features = this.createFeturesFromGeoJson(data.features);
		let oldFeatures = this.source.getFeatures();
		if (oldFeatures.length > 0) {
			for (let i = oldFeatures.length - 1; i >= 0; i--) {
				if (oldFeatures[i].getProperties().id === features[i].getProperties().id) {
					// remove old from features
					features.splice(i, 1);
				}
			}
		}
		this.source.addFeatures(features);
		this.iMap.mapObject.render();
	}

	createFeturesFromGeoJson(geoJsonFeatures) {
		const features = geoJsonFeatures.map((d) => this.geoJsonFormat.readFeature(d));
		(<Array<any>>features).forEach(feature => {

			const properties = feature.getProperties();
			let geometry;

			// @TODO convert the coordinates from the properties.data.coordinates that are saved in espg:4326 to the current projection
			// and create new geometry

			// save the feature to this.feature;

			geometry = feature.getGeometry();
			if (properties.geometryName === `${this.namePrefix}Circle`) {
				geometry = new GeomCircle(geometry.getCoordinates(), properties.radius);
			}
			feature.setGeometryName(properties.geometryName);
			feature.setGeometry(geometry);
			feature.setStyle(this.styleFunction(feature, undefined, properties.style));
		});

		return features;
	}

	removeInteraction() {
		if (this.interactionHandler) {
			this.iMap.mapObject.removeInteraction(this.interactionHandler);
		}
	}

	onDrawEndEvent(data) {
		const geometryName = data.feature.getGeometryName();

		data.feature.setStyle(this.styleFunction(data.feature, undefined));

		data.feature.setProperties({
			id: Date.now(),
			style: this.visualizerStyle,
			geometryName,
			data: {}
		});

		let geoJsonSingleFeature = this.geoJsonFormat.writeFeature(data.feature);

		if (geometryName === `${this.namePrefix}Circle`) {

			const circleGeo = JSON.parse(geoJsonSingleFeature);

			circleGeo.geometry = {
				type: 'Point',
				coordinates: data.feature.getGeometry().getCenter()
			};

			circleGeo.properties = {
				...circleGeo.properties, ...circleGeo.properties.data,
				radius: data.feature.getGeometry().getRadius()
			};
			geoJsonSingleFeature = JSON.stringify(circleGeo);
		}

		// @TODO add conversion from the map project to the 4326 project and save it in the properties.data.coordinates

		this.features.push(geoJsonSingleFeature);
		this.events.get('drawEndPublisher').next(this.features);
		// this.collection = featureCollection(this.features);
		this.removeInteraction();
		this.addSelectInteraction();
	}

	addInteraction() {


		if (this.interactionHandler) {

			this.interactionHandler.on('drawend', this.onDrawEndEvent.bind(this));
			this.removeSelectInteraction();
			this.iMap.mapObject.addInteraction(this.interactionHandler);
		}
	}

	createInteraction(type) {
		this.removeInteraction();

		if (this.currentInteraction === type) {
			this.currentInteraction = undefined;
			this.addSelectInteraction();
			return;
		}

		this.currentInteraction = type;

		this.interactionHandler = new Draw({
			source: this.source,
			type: type,
			geometryName: `${this.namePrefix}${type}`,


		});

		this.addInteraction();
	}

	arrowInteraction() {
		this.removeInteraction();
		if (this.currentInteraction === 'Arrow') {
			this.currentInteraction = undefined;
			this.addSelectInteraction();
			return;
		}
		this.currentInteraction = 'Arrow';
		this.interactionHandler = new Draw({
			source: this.source,
			type: 'LineString',
			geometryName: `${this.namePrefix}Arrow`,
		});
		this.addInteraction();
	}

	rectangleInteraction() {
		this.removeInteraction();
		if (this.currentInteraction === 'Rectangle') {
			this.currentInteraction = undefined;
			this.addSelectInteraction();
			return;
		}
		this.currentInteraction = 'Rectangle';

		const type = 'Circle';
		const geometryFunction = Draw.createBox(4);
		this.interactionHandler = new Draw({
			source: this.source,
			type: type,
			geometryFunction,
			geometryName: `${this.namePrefix}Box`
		});
		this.addInteraction();
	}

	protected initLayers() {
		this.source = new VectorLayer({
			source: this.source,
			style: this.styleFunction.bind(this)
		});
	}

	arrowStyle(feature, resolution) {
		const geometry = feature.getGeometry();

		const styles = [new Style({ stroke: new Stroke(this.visualizerStyle.initial.stroke) })];

		const cordinates = geometry.getCoordinates();
		// draw the arrows on the last segment
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

	styleFunction(feature, resolution, style = this.visualizerStyle.initial) {
		if (feature.getGeometryName() === `${this.namePrefix}Arrow`) {
			return this.arrowStyle(feature, resolution);
		}

		if (feature.getGeometryName() === `${this.namePrefix}Point`) {
			return new Style({
				image: new Circle({
					radius: style.point.radius,
					fill: new Fill({
						color: style.fill.color
					}),
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
			fill: new Fill(style.fill)
		});
	}

	dispose() {
		super.dispose();
		this.removeLayer();
	}
}
