import { EntitiesVisualizer } from './entities-visualizer';
import { IMap } from '../imagery/model/imap';
import Draw from 'ol/interaction/draw';
import VectorSource from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Circle from 'ol/style/circle';
import GeomCircle from 'ol/geom/circle';
import LineString from 'ol/geom/linestring';
import GeoJSON from 'ol/format/geojson';
import { featureCollection } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { Subject } from 'rxjs/Subject';


export const AnnotationVisualizerType = 'AnnotationVisualizer';


export class AnnotationsVisualizer extends EntitiesVisualizer {
	public _source: VectorSource;
	public layer: VectorLayer;

	public interactionHandler: Draw;
	public currentInteraction;
	public geoJsonFormat: GeoJSON;
	public features: Array<any>;
	public collection: FeatureCollection<any>;
	public fill;
	public namePrefix = 'Annotate-';
	public data;
	public drawEndPublisher = new Subject();

	// add special type for this one
	public style: any = {
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

	};

	constructor(style?: any){
		super(AnnotationVisualizerType,[]);
		if(style){
			this.style = style;
		}
		this.geoJsonFormat = new GeoJSON();
		this.features = [];
		this.fill = true;
	}

	onInit(mapId: string, map: IMap){
		this._imap = map;
		this._mapId = mapId;
	}

	onResetView(){
		this.addLayer();
		this.redrawFromGeoJson();
	}

	getGeoJson() {
		return JSON.stringify(this.getFeatures());
	}

	getFeatures(){
		return featureCollection(this.features);
	}

	changeStroke(color) {
		this.style.stroke.color = color;
	}

	changeFill(color) {
		this.style.fill.color = color;
	}

	changeLine(width) {
		this.style.stroke.width = width;
	}

	addLayer(id = this.type){
		const layer = new VectorLayer();
		//if id is empty then set the current type name as id
		layer.set('id',id );
		this.layer = this._imap.addLayerIfNotExist(layer);

		this._source = new VectorSource({wrapX: false});
		this.layer.setSource(this._source);
		this.layer.setStyle(this.styleFunction.bind(this))
		this.layer.setZIndex(200000)
	}

	removeLayer(){
		this._imap.removeLayer(this.layer);
	}

	redrawFromGeoJson() {
		//const geoFeatures = this.collection;
		this._source.clear();
		this.collection = undefined;
		const features = this.createFeturesFromGeoJson(this.features);
		this._source.addFeatures(features);
	}

	drawFeatures(data) {
		if(data === undefined){
			return ;
		}

		if(typeof data === 'string') {
			data = JSON.parse(data);
		}
		// readFeatures throw exceptions so I am using this method

		const features = this.createFeturesFromGeoJson(data.features);
		this._source.addFeatures(features);
	}

	createFeturesFromGeoJson(geoJsonFeatures) {
		const features = geoJsonFeatures.map((d) =>  this.geoJsonFormat.readFeature(d));
		//@TODO reset this.features
		(<Array<any>>features).forEach( feature => {

			const properties = feature.getProperties();
			let geometry;

			//@TODO convert the coordinates from the properties.data.coordinates that are saved in espg:4326 to the current projection
			// and create new geometry

			//save the feature to this.feature;

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
			this._imap.mapObject.removeInteraction(this.interactionHandler);
		}
	}

	onDrawEndEvent(data) {
		const geometryName = data.feature.getGeometryName();

		data.feature.setStyle(this.styleFunction(data.feature, undefined));

		data.feature.setProperties({
			id: Date.now(),
			style: this.style,
			geometryName,
			data: {}
		});

		let geoJsonSingleFeature = this.geoJsonFormat.writeFeature(data.feature);

		if (geometryName === `${this.namePrefix}Circle`) {

			const circleGeo  = JSON.parse(geoJsonSingleFeature);

			circleGeo.geometry = {
				type: 'Point',
				coordinates: data.feature.getGeometry().getCenter()
			};

			circleGeo.properties = {...circleGeo.properties, ...circleGeo.properties.data, radius: data.feature.getGeometry().getRadius() };
			geoJsonSingleFeature = JSON.stringify(circleGeo);
		}

		//@TODO add convertion from the map project to the 4326 project and save it in the properties.data.coordinates

		this.features.push(geoJsonSingleFeature);
		this.drawEndPublisher.next(this.features);
		//this.collection = featureCollection(this.features);
	}

	addInteraction() {


		if (this.interactionHandler) {

			this.interactionHandler.on('drawend',this.onDrawEndEvent.bind(this));

			this._imap.mapObject.addInteraction(this.interactionHandler);
		}
	}

	createInteraction(type) {
		this.removeInteraction();

		if (this.currentInteraction === type) {
			this.currentInteraction = undefined;
			return;
		}

		this.currentInteraction = type;

		this.interactionHandler = new Draw({
			source: this._source,
			type: type,
			geometryName: `${this.namePrefix}${type}`,


		});

		this.addInteraction();
	}

	arrowInteraction() {
		this.removeInteraction();
		if (this.currentInteraction === 'Arrow') {
			this.currentInteraction = undefined;
			return;
		}
		this.currentInteraction = 'Arrow';
		this.interactionHandler = new Draw({
			source: this._source,
			type: 'LineString',
			geometryName: `${this.namePrefix}Arrow`,
		});
		this.addInteraction();
	}

	rectangleInteraction() {
		this.removeInteraction();
		if (this.currentInteraction === 'Rectangle') {
			this.currentInteraction = undefined;
			return;
		}
		this.currentInteraction = 'Rectangle';

		const type = 'Circle';
		const geometryFunction = Draw.createBox(4);
		this.interactionHandler = new Draw({
			source: this._source,
			type: type,
			geometryFunction,
			geometryName: `${this.namePrefix}Box`
		});
		this.addInteraction();
	}

	createLayer() {
			this._source = new VectorLayer({
				source: this._source,
				style: this.styleFunction.bind(this)
			})
	}

	arrowStyle(feature, resolution) {
		const geometry = feature.getGeometry();

		const styles = [
			// linestring
			new Style({
				stroke: new Stroke({
					color: this.style.stroke.color,
					width: this.style.stroke.width
				})
			})
		];
		const cordinates = geometry.getCoordinates();
		// draw the arrows on the last segment
		const start = cordinates[cordinates.length - 2];
		const end  = cordinates[cordinates.length - 1];

		const dx = end[0] - start[0];
		const dy = end[1] - start[1];
		const rotation = Math.atan2(dy, dx);
		const lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		// console.log(lineLength);
		const factor = lineLength * 0.1;
		const lineStr1 = new LineString([end, [end[0] - factor, end[1] + factor]]);
		lineStr1.rotate(rotation, end);
		const lineStr2 = new LineString([end, [end[0] - factor, end[1] - factor]]);
		lineStr2.rotate(rotation, end);

		const stroke = new Stroke({
			color: this.style.stroke.color,
			width: this.style.stroke.width
		});

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

	styleFunction(feature, resolution, style = this.style) {
		if (feature.getGeometryName() === `${this.namePrefix}Arrow`) {
			return this.arrowStyle(feature, resolution);
		}

		if (feature.getGeometryName() === `${this.namePrefix}Point`) {
			return new Style({
				image: new Circle({
					radius:   style.point.radius,
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
			stroke: new Stroke({
				color: style.stroke.color,
				width: style.stroke.width
			}),
			fill: new Fill ({
				color: style.fill.color,
			})
		});
	}

	dispose(){
		super.dispose();
		this.removeLayer();
	}

}
