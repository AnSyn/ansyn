import { merge } from 'lodash';
import SourceVector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import ol_Layer from 'ol/layer/Layer';
import OLGeoJSON from 'ol/format/GeoJSON';
import { getArea } from 'ol/sphere';
import SelectEvent from 'ol/interaction/Select';
import * as olExtent from 'ol/extent';
import {
	BaseImageryVisualizer,
	calculateLineDistance,
	getPointByGeometry,
	IVisualizerEntity,
	IVisualizerStateStyle,
	IVisualizerStyle,
	MarkerSizeDic,
	VisualizerInteractionTypes,
	VisualizerStates
} from '@ansyn/imagery';
import { forkJoin, Observable, of } from 'rxjs';
import * as ol_color from 'ol/color';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { map } from 'rxjs/operators';
import { featureCollection } from '@turf/turf';

export interface IFeatureIdentifier {
	feature: Feature;
	originalEntity: IVisualizerEntity;
	cachedFeatureStyle?: any;
}

export abstract class EntitiesVisualizer extends BaseImageryVisualizer {
	isHidden = false;
	public source: SourceVector;
	vector: ol_Layer;
	public idToEntity: Map<string, IFeatureIdentifier> = new Map<string, { feature: null, originalEntity: null, cachedFeatureStyle: null }>();
	offset: [number, number] = [0, 0];
	interactions: Map<VisualizerInteractionTypes, any> = new Map<VisualizerInteractionTypes, any>();
	protected featuresCollection: Feature[];
	protected disableCache = false;
	protected useCachedStyleForUpdatedEntities = false;
	protected visualizerStyle: IVisualizerStateStyle = {
		opacity: 1,
		initial: {
			fill: 'transparent',
			stroke: 'blue',
			'stroke-width': 3,
			'stroke-dasharray': 0
		}
	};

	constructor(visualizerStyle: Partial<IVisualizerStateStyle> = {}, defaultStyle: Partial<IVisualizerStateStyle> = {}) {
		super();
		merge(this.visualizerStyle, defaultStyle, visualizerStyle);
	}

	getEntity(feature: Feature): IVisualizerEntity {
		return this.getEntityById(<string>feature.getId());
	}

	getEntityById(featureId: string): IVisualizerEntity {
		const entity = this.idToEntity.get(featureId);
		return entity && entity.originalEntity;
	}

	getCachedEntityOLStyleById(featureId: string): any {
		const entity = this.idToEntity.get(featureId);
		return entity && entity.cachedFeatureStyle;
	}

	setCachedEntityOLStyleById(featureId: string, olStyle) {
		const entity = this.idToEntity.get(featureId);
		if (entity) { // if it's a feature from interaction (draws new) it doesn't exist's in the dictionary so we ignore it
			this.idToEntity.set(featureId, {
				feature: entity.feature,
				originalEntity: entity.originalEntity,
				cachedFeatureStyle: olStyle
			});
		}
	}

	getJsonFeatureById(featureId: string): Feature {
		const originalEntity = this.getEntityById(featureId);
		return originalEntity && originalEntity.featureJson;
	}

	onInit() {
		super.onInit();
		this.initLayers();
	}

	protected initLayers() {
		this.createStaticLayers();
		this.resetInteractions();
	}

	protected createStaticLayers() {
		this.featuresCollection = [];
		this.source = new SourceVector({ features: this.featuresCollection, wrapX: false });

		let extent = !this.dontRestrictToExtent ? (this.iMap.getMainLayer() as ol_Layer).getExtent() : undefined;
		this.vector = new VectorLayer(<any>{
			source: this.source,
			style: this.featureStyle.bind(this),
			opacity: this.visualizerStyle.opacity,
			renderBuffer: 5000,
			zIndex: 10,
			extent: extent
		});

		if (!this.isHidden) {
			this.iMap.addLayer(this.vector);
		}
	}

	protected resetInteractions(): void {

	}

	setVisibility(isVisible: boolean) {
		if (!this.isHideable) {
			return;
		}

		this.isHidden = !isVisible;
		if (this.isHidden) {
			this.iMap.removeLayer(this.vector);
		} else {
			this.iMap.addLayer((this.vector));
		}
	}

	public purgeCacheById(featureId: string) {
		if (this.idToEntity.has(featureId)) {
			const entitiy = this.idToEntity.get(featureId);
			if ((<any>entitiy.feature).styleCache) {
				delete (<any>entitiy.feature).styleCache;
			}
			this.idToEntity.set(featureId, {cachedFeatureStyle: null, originalEntity: entitiy.originalEntity, feature: entitiy.feature });
		}
	}

	public purgeCache(feature?: Feature) {
		if (feature) {
			delete (<any>feature).styleCache;
			const key = <string>feature.getId();
			if (this.idToEntity.has(key)) {
				const entitiy = this.idToEntity.get(key);
				this.idToEntity.set(key, {cachedFeatureStyle: null, originalEntity: entitiy.originalEntity, feature: feature });
			}
		} else if (this.source) {
			let features = this.source.getFeatures();
			features.forEach(f => this.purgeCache(f));
		}
	}

	protected fixStyleValues(feature: Feature, styleSettings: any) {
		Object.keys(styleSettings).forEach(key => {
			if (styleSettings[key]) {
				switch (typeof styleSettings[key]) {
					case 'function':
						styleSettings[key] = styleSettings[key](feature);
						break;
					case 'object':
						this.fixStyleValues(feature, styleSettings[key]);
						break;
				}
			}
		});
	}

	protected createStyle(feature: Feature, isStyle, ...styles: Array<Partial<IVisualizerStyle>>) {
		const styleSettings: IVisualizerStyle = merge({}, ...styles);
		this.fixStyleValues(feature, styleSettings);

		let firstStyle: any = {};
		let secondaryStyle: any = {};
		let textStyle: any = {};

		if (styleSettings.shadow) {
			secondaryStyle.stroke = new Stroke({
				color: styleSettings.shadow.stroke,
				width: styleSettings.shadow['stroke-width']
			});
		}

		if (styleSettings.stroke) {
			const color = this.colorWithAlpha(styleSettings.stroke, styleSettings['stroke-opacity']);
			const dash = styleSettings['stroke-dasharray'];
			const lineDash = dash > 0 ? [dash, 10] : undefined;
			const width = styleSettings['stroke-width'];
			const lineCap = dash > 0 ? 'square' : undefined;

			firstStyle.stroke = new Stroke({ color, lineDash, width, lineCap, lineDashOffset: 5 });
		}

		if (styleSettings.fill) {
			const color = this.colorWithAlpha(styleSettings.fill, styleSettings['fill-opacity']);
			firstStyle.fill = new Fill({ color });
		}

		if (styleSettings.icon) {
			firstStyle.image = new Icon(styleSettings.icon);
		}

		if (styleSettings.circle) {
			const radius = styleSettings.circle;
			firstStyle.image = new Circle({
				radius,
				fill: firstStyle.fill,
				stroke: firstStyle.stroke
			});
		}

		if (styleSettings.geometry) {
			secondaryStyle.image = firstStyle.image;
			secondaryStyle.geometry = styleSettings.geometry
		}

		if ((styleSettings.label && styleSettings.label.text) && !feature.getProperties().labelTranslateOn) {
			const fill = new Fill({ color: styleSettings.label.fill });
			const stroke = new Stroke({
				color: styleSettings.label.stroke ? styleSettings.label.stroke : '#fff',
				width: styleSettings.label.stroke ? 4 : 0
			});
			const { label } = styleSettings;

			textStyle.text = new Text({
				overflow: label.overflow,
				font: `${ styleSettings.label.fontSize }px Calibri,sans-serif`,
				offsetY: <any>styleSettings.label.offsetY,
				text: <any>label.text,
				fill,
				stroke
			});
			textStyle.geometry = (feature) => {
				const { label } = feature.getProperties();
				if (label.geometry) {
					const oldCoordinates = label.geometry.getCoordinates();
					const newCoordinates = [this.offset[0] + oldCoordinates[0], this.offset[1] + oldCoordinates[1]];
					return new Point(newCoordinates);
				}
				return new Point(this.getCenterOfFeature(feature).coordinates)
			};

			firstStyle.geometry = (feature) => feature.getGeometry();
		}

		if (styleSettings['marker-color'] || styleSettings['marker-size']) {
			const color = styleSettings['marker-color'];
			const radius = MarkerSizeDic[styleSettings['marker-size']];
			firstStyle.image = new Circle({ fill: new Fill({ color }), stroke: null, radius });
		}


		return [firstStyle, textStyle, secondaryStyle].map(style => isStyle ? new Style(style) : style);
	}

	colorWithAlpha(color, alpha = 1) {
		const [r, g, b] = Array.from(ol_color.asArray(color));
		return ol_color.asString([r, g, b, alpha]);
	}

	featureStyle(feature: Feature, state: string = VisualizerStates.INITIAL) {
		if (this.disableCache || !(<any>feature).styleCache) {
			const styles = [
				this.visualizerStyle[VisualizerStates.INITIAL], // Weakest
				this.visualizerStyle[state]
			];

			const entity = this.getEntity(feature);
			if (entity) {
				if (this.useCachedStyleForUpdatedEntities) {
					const cachedStyle = this.getCachedEntityOLStyleById(feature.getId());
					if (cachedStyle) {
						(<any>feature).styleCache = cachedStyle;
						return cachedStyle;
					}
				}

				if (entity.type && this.visualizerStyle.entities && this.visualizerStyle.entities[entity.type]) {
					styles.push(this.visualizerStyle.entities[entity.type][VisualizerStates.INITIAL]);
					styles.push(this.visualizerStyle.entities[entity.type][state]);
				}

				if (entity.style) {
					styles.push(entity.style[VisualizerStates.INITIAL]);
					styles.push(entity.style[state]);
				}
			}

			(<any>feature).styleCache = this.createStyle(feature, true, ...styles);
		}
		this.setCachedEntityOLStyleById(feature.getId(), (<any>feature).styleCache);
		return (<any>feature).styleCache;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[], forceClearAllExistingEntites?: boolean): Observable<boolean> {
		const filteredLogicalEntities = logicalEntities.filter(entity => Boolean(entity.id));

		if (filteredLogicalEntities.length < logicalEntities.length) {
			console.warn('Got empty id\'s for some map features/annotations');
		}

		// save old cached styles
		const cachedOldEntitiesStyles: Map<string, any> = new Map<string, any>();
		if (this.useCachedStyleForUpdatedEntities) {
			this.idToEntity.forEach((val, key) => {
				cachedOldEntitiesStyles.set(key, val.cachedFeatureStyle);
			});
		}

		if (!forceClearAllExistingEntites) {
			filteredLogicalEntities.forEach((entity: IVisualizerEntity) => {
				this.removeEntity(entity.id, true);
			});
		} else {
			this.clearEntities();
		}

		if (filteredLogicalEntities.length <= 0) {
			return of(true);
		}
		const features = [];
		const labels = [];
		filteredLogicalEntities.forEach(entity => {
			features.push({ ...entity.featureJson, id: entity.id });
			if (entity.label && entity.label.geometry) {
				const temp = this.geometryToEntity(entity.id, entity.label.geometry);
				labels.push({ ...temp.featureJson, id: temp.id });
			}
		});

		const featuresCollectionToAdd: any = featureCollection(features);
		const labelCollectionToAdd: any = featureCollection(labels);
		const featuresProject = (<OpenLayersMap>this.iMap).projectionService.projectCollectionAccuratelyToImage<Feature>(featuresCollectionToAdd, this.iMap.mapObject);
		const labelsProject = (<OpenLayersMap>this.iMap).projectionService.projectCollectionAccuratelyToImage<Feature>(labelCollectionToAdd, this.iMap.mapObject);
		return forkJoin(featuresProject, labelsProject)
			.pipe(map(([features, labels]: [Feature[], Feature[]]) => {
				features.forEach((feature: Feature) => {
					const _id: string = <string>feature.getId();
					const label = labels.find(label => label.getId() === _id);

					let cachedFeatureStyle;
					if (cachedOldEntitiesStyles.has(_id)) {
						cachedFeatureStyle = cachedOldEntitiesStyles.get(_id);
					}
					const entity: IFeatureIdentifier = {
						originalEntity: filteredLogicalEntities.find(({ id }) => id === _id),
						feature: feature,
						cachedFeatureStyle: cachedFeatureStyle
					};
					entity.feature.set('label', { ...feature.get('label'), geometry: label && label.getGeometry() });
					this.idToEntity.set(_id, entity);
					const featureWithTheSameId = this.source.getFeatureById(_id);
					if (featureWithTheSameId) {
						this.source.removeFeature(featureWithTheSameId);
					}
					if (this.offset[0] !== 0 || this.offset[1] !== 0) {
						const geometry = feature.getGeometry();
						geometry.translate(this.offset[0], this.offset[1]);
					}
				});
				this.source.addFeatures(features);
				return true;
			}));
	}

	setEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		return this.addOrUpdateEntities(logicalEntities, true);
	}

	removeEntity(logicalEntityId: string, internal = false) {
		if (!logicalEntityId) {
			return;
		}
		const entityToRemove = this.idToEntity.get(logicalEntityId);
		if (!entityToRemove) {
			return;
		}
		this.idToEntity.delete(logicalEntityId);
		const featureId = entityToRemove.feature.getId();
		if (entityToRemove.feature && this.source.getFeatureById(entityToRemove.feature.getId())) {
			const existingFeatures = this.source.getFeatures();
			const exists = existingFeatures.find((feature) => {
				return feature.ol_uid === entityToRemove.feature.ol_uid;
			});
			if (exists) {
				this.source.removeFeature(entityToRemove.feature);
			} else {
				console.warn('can\'t remove feature id ', featureId, ' ol_id ', entityToRemove.feature.ol_uid);
			}
		}
	}

	clearEntities() {
		if (this.idToEntity) {
			this.idToEntity.clear();
		}
		if (this.source) {
			this.source.clear(true);
		}
	}

	getEntities(): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		this.idToEntity.forEach((val, key) => entities.push(val.originalEntity));
		return entities;
	}

	onResetView(): Observable<boolean> {
		const currentEntities: IVisualizerEntity[] = this.getEntities();
		this.clearEntities();
		this.initLayers();
		// todo: activate the use cached style flag for new drawings
		return this.addOrUpdateEntities(currentEntities, true);
	}

	updateStyle(style: Partial<IVisualizerStateStyle>) {
		merge(this.visualizerStyle, style);
		this.purgeCache();
	}

	getInteraction(type: VisualizerInteractionTypes) {
		return this.interactions.get(type);
	}

	addInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void {
		this.iMap.mapObject.addInteraction(interactionInstance);
		this.interactions.set(type, interactionInstance);
	}

	removeInteraction(type: VisualizerInteractionTypes) {
		if (this.interactions.has(type)) {
			const interactionInstance: any = this.interactions.get(type);
			this.iMap.mapObject.removeInteraction(interactionInstance);
			this.interactions.delete(type);
		}
	}

	geometryToEntity(id, geometry): IVisualizerEntity {
		const featureJson: GeoJSON.Feature<any> = {
			type: 'Feature',
			geometry,
			properties: {}
		};
		return { id, featureJson };
	}

	protected getCenterOfFeature(feature: Feature) {
		const featureGeoJson = new OLGeoJSON().writeFeatureObject(feature);
		return getPointByGeometry(featureGeoJson.geometry);
	}

	formatLength(coordinates: number[][]) {
		const length = coordinates.reduce((length: number, coord, index, arr) => {
			if (arr[index + 1] === undefined) {
				return length;
			}
			const aPoint = new OLGeoJSON().writeGeometryObject(new Point(coord));
			const bPoint = new OLGeoJSON().writeGeometryObject(new Point(arr[index + 1]));
			return length + calculateLineDistance(aPoint, bPoint);
		}, 0);

		if (length < 1) {
			return (length * 1000).toFixed(2) + 'm';
		} else {
			return length.toFixed(2) + 'km';
		}
	}

	formatArea(geometry) {
		const fractionDigits = 2;
		const projection = this.iMap.getProjectionCode();
		const area = getArea(geometry, { projection });

		if (area >= 1000) {
			return (area / 1000).toFixed(fractionDigits) + 'km2';
		}

		return (area).toFixed(fractionDigits) + 'm2';
	}

	isMouseEventInExtent(event: SelectEvent): boolean {
		const coordinate = event.mapBrowserEvent.coordinate;
		const extent = this.vector.getExtent();
		const result = olExtent.containsCoordinate(extent, coordinate);
		return result;
	}

	featureAtPixel = (pixel) => {
		if (!Boolean(pixel) || !Boolean(pixel.length)) {
			return undefined;
		}
		const featuresArray = [];
		this.iMap.mapObject.forEachFeatureAtPixel(pixel, feature => {
			featuresArray.push(feature);
		}, { hitTolerance: 2, layerFilter: (layer) => this.vector === layer });
		return this.findFeatureWithMinimumArea(featuresArray);
	};

	entityAtPixel(pixel): IVisualizerEntity {
		const feature = this.featureAtPixel(pixel);
		if (!feature) {
			return undefined;
		}
		const entity = this.getEntity(feature);
		return entity;
	}

	findFeatureWithMinimumArea(featuresArray: any[]) {
		return featuresArray.reduce((prevResult, currFeature) => {
			const currGeometry = currFeature.getGeometry();
			const currArea = currGeometry.getArea ? currGeometry.getArea() : 0;
			if (currArea < prevResult.area) {
				return { feature: currFeature, area: currArea };
			} else {
				return prevResult;
			}
		}, { feature: null, area: Infinity }).feature;
	}
}
