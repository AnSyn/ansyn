import { IMapVisualizer, IVisualizerEntity } from '@ansyn/imagery';
import { EventEmitter } from '@angular/core';
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
import { Subscriber } from 'rxjs/Subscriber';
import { VisualizerStyle } from './models/visualizer-style';
import { VisualizerStateStyle } from './models/visualizer-state';
import { VisualizerEventTypes, VisualizerInteractionTypes } from '@ansyn/imagery/model/imap-visualizer';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { FeatureCollection, GeoJsonObject, GeometryObject } from 'geojson';
import { Observable } from 'rxjs/Observable';

export interface FeatureIdentifier {
	feature: Feature,
	originalEntity: IVisualizerEntity
}

export const VisualizerStates = {
	INITIAL: 'initial',
	HOVER: 'hover'
};

export const EntitiesVisualizerType = 'EntitiesVisualizer';


export abstract class EntitiesVisualizer implements IMapVisualizer {
	static type = EntitiesVisualizerType;

	isHideable = false;
	isHidden = false;

	protected iMap: OpenLayersMap;
	protected mapId: string;
	public source: SourceVector;
	protected featuresCollection: Feature[];
	vector: VectorLayer;
	protected idToEntity: Map<string, FeatureIdentifier> = new Map<string, { feature: null, originalEntity: null }>();
	protected disableCache = false;

	protected visualizerStyle: VisualizerStateStyle = {
		opacity: 1,
		initial: {
			fill: {
				color: 'transparent'
			},
			stroke: {
				color: 'blue',
				width: 3
			}
		},
	};

	onDisposedEvent: EventEmitter<void> = new EventEmitter<void>();
	subscribers: Subscriber<any>[] = [];

	interactions: Map<VisualizerInteractionTypes, any> = new Map<VisualizerInteractionTypes, any>();
	events: Map<VisualizerEventTypes, EventEmitter<any>> = new Map<VisualizerEventTypes, EventEmitter<any>>();

	constructor(public type: string, visualizerStyle: Partial<VisualizerStateStyle>, defaultStyle: Partial<VisualizerStateStyle> = {}) {
		merge(this.visualizerStyle, defaultStyle, visualizerStyle);
	}

	private getEntity(feature: Feature): IVisualizerEntity {
		const entity = this.idToEntity.get(<string>feature.getId());
		return entity && entity.originalEntity;
	}

	onInit(mapId: string, map: OpenLayersMap) {
		this.iMap = map;
		this.mapId = mapId;
		this.initLayers();
		this.resetEvents();
	}

	protected initLayers() {
		this.createStaticLayers();
		this.resetInteractions();
	}

	protected createStaticLayers() {
		this.featuresCollection = [];
		this.source = new SourceVector({ features: this.featuresCollection });

		this.vector = new VectorLayer(<any>{
			source: this.source,
			style: this.featureStyle.bind(this),
			opacity: this.visualizerStyle.opacity
		});

		if (!this.isHidden) {
			this.iMap.addLayer(this.vector);
		}
	}

	protected resetInteractions(): void {

	}

	protected resetEvents(): void {

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

	protected createStyle(feature: Feature, isStyle, ...styles: Array<Partial<VisualizerStyle>>) {
		const styleSettings: any = merge({}, ...styles);
		this.fixStyleValues(feature, styleSettings);

		let secondaryStyle: any = {};

		if (styleSettings.shadow) {
			secondaryStyle.stroke = new Stroke(styleSettings.shadow);
			delete styleSettings.shadow;
		}

		if (styleSettings.stroke) {
			styleSettings.stroke = new Stroke(styleSettings.stroke);
		}

		if (styleSettings.fill) {
			styleSettings.fill = new Fill(styleSettings.fill);
		}

		if (styleSettings.icon) {
			styleSettings.image = new Icon(styleSettings.icon);
		}

		if (styleSettings.label) {
			styleSettings.text = new Text(this.createStyle(feature, false, styleSettings.label));
		}

		if (styleSettings.point) {
			const { fill, stroke } = styleSettings;
			styleSettings.image = new Circle({ fill, stroke, ...styleSettings.point } );
		}

		if (Object.keys(secondaryStyle).length !== 0) {
			return [styleSettings, secondaryStyle].map(s => new Style(s));
		}

		return isStyle ? new Style(styleSettings) : styleSettings;
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

		const logicalEntitiesCopy = [...logicalEntities];

		const featuresCollectionToAdd: GeoJSON.FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: []
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity) => {
			this.removeEntity(entity.id);
			const clonedFeatureJson: any = { ...entity.featureJson, id: entity.id };
			featuresCollectionToAdd.features.push(clonedFeatureJson);
			this.idToEntity.set(entity.id, { originalEntity: entity, feature: null });
		});

		return this.iMap.projectionService.projectCollectionAccuratelyToImage<Feature>(featuresCollectionToAdd, this.iMap)
			.map((features: Feature[]) => {
			features.forEach((feature: Feature) => {
				const id: string = <string>feature.getId();
				const existingEntity = this.idToEntity.get(id);
				this.idToEntity.set(id, { ...existingEntity, feature: feature });
			});
			this.source.addFeatures(features);
			return true;
		});
	}

	setEntities(logicalEntities: IVisualizerEntity[]) {
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

		this.addOrUpdateEntities(logicalEntities).subscribe();
	}

	removeEntity(logicalEntityId: string) {
		const entityToRemove = this.idToEntity.get(logicalEntityId);
		if (entityToRemove) {
			this.idToEntity.delete(logicalEntityId);
			this.source.removeFeature(entityToRemove.feature);
		}
	}

	clearEntities() {
		this.idToEntity.clear();
		this.source.clear(true);
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

	dispose() {
		this.onDisposedEvent.emit();
		this.subscribers.forEach(sub => sub.unsubscribe());
		this.subscribers = [];
	}

	updateStyle(style: Partial<VisualizerStateStyle>) {
		merge(this.visualizerStyle, style);
		this.purgeCache();
	}


	updateFeatureStyle(featureId: string, style: Partial<VisualizerStateStyle>) {
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

	addEvent(type: VisualizerEventTypes): void {
		this.events.set(type, new EventEmitter<any>());
	}

	removeEvent(type: VisualizerEventTypes) {
		this.events.delete(type);
	}
}
