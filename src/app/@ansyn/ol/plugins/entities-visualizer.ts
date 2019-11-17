import { merge } from 'lodash';
import SourceVector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Icon from 'ol/style/Icon';
import VectorLayer from 'ol/layer/Vector';
import ol_Layer from 'ol/layer/Layer';

import {
	BaseImageryVisualizer,
	IVisualizerEntity,
	IVisualizerStateStyle,
	IVisualizerStyle,
	MarkerSizeDic,
	VisualizerInteractionTypes,
	VisualizerStates
} from '@ansyn/imagery';
import { Observable, of } from 'rxjs';
import * as ol_color from 'ol/color';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { map } from 'rxjs/operators';
import { featureCollection } from '@turf/turf';

export interface IFeatureIdentifier {
	feature: Feature,
	originalEntity: IVisualizerEntity
}

export abstract class EntitiesVisualizer extends BaseImageryVisualizer {
	isHidden = false;
	public source: SourceVector;
	protected featuresCollection: Feature[];
	vector: ol_Layer;
	public idToEntity: Map<string, IFeatureIdentifier> = new Map<string, { feature: null, originalEntity: null }>();
	protected disableCache = false;

	protected visualizerStyle: IVisualizerStateStyle = {
		opacity: 1,
		initial: {
			fill: 'transparent',
			stroke: 'blue',
			'stroke-width': 3,
			'stroke-dasharray': 0
		}
	};

	offset: [number, number] = [0, 0];

	interactions: Map<VisualizerInteractionTypes, any> = new Map<VisualizerInteractionTypes, any>();

	constructor(visualizerStyle: Partial<IVisualizerStateStyle> = {}, defaultStyle: Partial<IVisualizerStateStyle> = {}) {
		super();
		merge(this.visualizerStyle, defaultStyle, visualizerStyle);
	}

	getEntity(feature: Feature): IVisualizerEntity {
		const entity = this.idToEntity.get(<string>feature.getId());
		return entity && entity.originalEntity;
	}

	onInit() {
		this.initLayers();
	}

	protected initLayers() {
		this.createStaticLayers();
		this.resetInteractions();
	}

	protected createStaticLayers() {
		this.featuresCollection = [];
		this.source = new SourceVector({ features: this.featuresCollection, wrapX: false });

		this.vector = new VectorLayer(<any>{
			source: this.source,
			style: this.featureStyle.bind(this),
			opacity: this.visualizerStyle.opacity,
			renderBuffer: 5000,
			zIndex: 10
		});

		if (!this.isHidden) {
			this.iMap.addLayer(this.vector);
		}
	}

	protected resetInteractions(): void {

	}

	toggleVisibility() {
		if (!this.isHideable) {
			return;
		}

		this.isHidden = !this.isHidden;
		if (this.isHidden) {
			this.iMap.removeLayer(this.vector);
		} else {
			this.iMap.addLayer((this.vector));
		}
	}

	public purgeCache(feature?: Feature) {
		if (feature) {
			delete (<any>feature).styleCache;
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
			const lineDash = dash > 0 ? [dash , 10] : undefined;
			const width =  styleSettings['stroke-width'];
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

		if (styleSettings.label) {
			const fill = new Fill({ color: styleSettings.label.fill });
			const stroke = new Stroke({
				color: styleSettings.label.stroke ? styleSettings.label.stroke : '#fff',
				width: styleSettings.label.stroke ? 4 : 0
			});

			textStyle.text = new Text({
				font: styleSettings.label.font,
				offsetX: styleSettings.label.offsetX,
				offsetY: <any>styleSettings.label.offsetY,
				overflow: styleSettings.label.overflow,
				text: <any>styleSettings.label.text,
				fill,
				stroke
			});
			if (feature.getProperties().mode === 'Arrow') {
				textStyle.geometry = (feature) => {
					if (feature.getGeometry().getLineString) {
						return feature.getGeometry().getLineString(0)
					}
					else { // for kml import
						return feature.getGeometry().getGeometries()[0];
					}
				}
			}
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

		return (<any>feature).styleCache;
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		const filteredLogicalEntities = logicalEntities.filter(entity => Boolean(entity.id));

		if (filteredLogicalEntities.length < logicalEntities.length) {
			console.warn('Got empty id\'s for some map features/annotations');
		}

		if (filteredLogicalEntities.length <= 0) {
			return of(true);
		}
		const features = filteredLogicalEntities.map(entity => ({ ...entity.featureJson, id: entity.id }));

		const featuresCollectionToAdd: any = featureCollection(features);

		filteredLogicalEntities.forEach((entity: IVisualizerEntity) => {
			this.removeEntity(entity.id, true);
		});

		return (<OpenLayersMap>this.iMap).projectionService.projectCollectionAccuratelyToImage<Feature>(featuresCollectionToAdd, this.iMap.mapObject)
			.pipe(map((features: Feature[]) => {
				features.forEach((feature: Feature) => {
					const _id: string = <string>feature.getId();
					this.idToEntity.set(_id, <any>{
						originalEntity: filteredLogicalEntities.find(({ id }) => id === _id),
						feature: feature
					});
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
		const removedEntities = [];
		this.idToEntity.forEach(((value, key: string) => {
			const item = logicalEntities.find((entity) => entity.id === key);
			if (!item) {
				removedEntities.push(key);
			}
		}));

		removedEntities.forEach((id) => {
			this.removeEntity(id);
		});

		return this.addOrUpdateEntities(logicalEntities);
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
		return this.addOrUpdateEntities(currentEntities);
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

}
