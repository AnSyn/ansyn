import { merge } from 'lodash';
import SourceVector from 'ol/source/vector';
import Feature from 'ol/feature';
import Style from 'ol/style/style';
import Stroke from 'ol/style/stroke';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Icon from 'ol/style/icon';
import VectorLayer from 'ol/layer/vector';
import ol_Layer from 'ol/layer/layer';

import { IVisualizerStyle, MarkerSizeDic } from '@ansyn/core/models/visualizers/visualizer-style';
import { IVisualizerStateStyle, VisualizerStates } from '@ansyn/core/models/visualizers/visualizer-state';
import { FeatureCollection } from 'geojson';
import { Observable } from 'rxjs';
import {
	BaseImageryVisualizer,
	IBaseImageryVisualizerClass,
	VisualizerInteractionTypes
} from '@ansyn/imagery/model/base-imagery-visualizer';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import ol_color from 'ol/color';
export interface IFeatureIdentifier {
	feature: Feature,
	originalEntity: IVisualizerEntity
}

export abstract class EntitiesVisualizer extends BaseImageryVisualizer {
	isHidden = false;
	public source: SourceVector;
	protected featuresCollection: Feature[];
	vector: ol_Layer;
	protected idToEntity: Map<string, IFeatureIdentifier> = new Map<string, { feature: null, originalEntity: null }>();
	protected disableCache = false;

	protected visualizerStyle: IVisualizerStateStyle = {
		opacity: 1,
		initial: {
			fill: 'transparent',
			stroke: 'blue',
			'stroke-width': 3
		}
	};

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
			renderBuffer: 5000
		});

		if (!this.isHidden) {
			this.iMap.addLayer(this.vector);
		}
	}

	protected resetInteractions(): void {

	}

	toggleVisibility() {
		if (!(<IBaseImageryVisualizerClass>this.constructor).isHideable) {
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

		if (styleSettings.shadow) {
			secondaryStyle.stroke = new Stroke({
				color: styleSettings.shadow.stroke,
				width: styleSettings.shadow['stroke-width']
			});
		}

		if (styleSettings.stroke) {
			const color = this.colorWithAlpha(styleSettings.stroke, styleSettings['stroke-opacity']);
			firstStyle.stroke = new Stroke({ color, width: styleSettings['stroke-width'] });
		}

		if (styleSettings.fill) {
			const color = this.colorWithAlpha(styleSettings.fill, styleSettings['fill-opacity']);
			firstStyle.fill = new Fill({ color });
		}

		if (styleSettings.icon) {
			firstStyle.image = new Icon(styleSettings.icon);
		}

		if (styleSettings.label) {
			firstStyle.text = new Text(this.createStyle(feature, false, styleSettings.label));
		}

		if (styleSettings['marker-color'] || styleSettings['marker-size']) {
			const color = styleSettings['marker-color'];
			const radius = MarkerSizeDic[styleSettings['marker-size']];
			firstStyle.image = new Circle({ fill: new Fill({ color }), stroke: null, radius });
		}

		if (Object.keys(secondaryStyle).length !== 0) {
			return [firstStyle, secondaryStyle].map(s => new Style(s));
		}

		return isStyle ? new Style(firstStyle) : firstStyle;
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
		if (logicalEntities.length <= 0) {
			return Observable.of(true);
		}

		const featuresCollectionToAdd = <FeatureCollection<any>> {
			type: 'FeatureCollection',
			features: logicalEntities.map(entity => ({ ...entity.featureJson, id: entity.id }))
		};

		logicalEntities.forEach((entity: IVisualizerEntity) => {
			this.removeEntity(entity.id);
		});

		return (<OpenLayersMap>this.iMap).projectionService.projectCollectionAccuratelyToImage<Feature>(featuresCollectionToAdd, this.iMap)
			.map((features: Feature[]) => {
				features.forEach((feature: Feature) => {
					const _id: string = <string>feature.getId();
					this.idToEntity.set(_id, <any>{
						originalEntity: logicalEntities.find(({ id }) => id === _id),
						feature: feature
					});
				});
				this.source.addFeatures(features);
				return true;
			});
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

	removeEntity(logicalEntityId: string) {
		const entityToRemove = this.idToEntity.get(logicalEntityId);
		if (entityToRemove) {
			this.idToEntity.delete(logicalEntityId);
			if (entityToRemove.feature && this.source.getFeatureById(entityToRemove.feature.getId())) {
				this.source.removeFeature(entityToRemove.feature);
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


	updateFeatureStyle(featureId: string, style: Partial<IVisualizerStateStyle>) {
		const feature = this.source.getFeatureById(featureId);

		const entity = this.getEntity(feature);
		if (entity) {
			entity.style = entity.style ? merge({}, entity.style, style) : style;
		}

		this.purgeCache(feature);
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
