import { EntitiesVisualizer } from '../entities-visualizer';
import Feature from 'ol/feature';
import Icon from 'ol/style/icon';
import Style from 'ol/style/style';
import { Observable } from 'rxjs/Observable';
import { IVisualizerEntity } from '@ansyn/imagery';
import { FeatureCollection } from 'geojson';

export const MouseShadowVisualizerType = 'MouseShadowVisualizer';

export class MouseShadowVisualizer extends EntitiesVisualizer {
	_iconSrc: Style;

	// constructor(iconPath: string, args: any) {
	constructor() {
		super();
		// set icon
		this._iconSrc = new Style({
			image: new Icon({
				scale: 1,
				src: '/assets/icons/tools/mouse-shadow.svg'
			}),
			zIndex: 200
		});
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		if (logicalEntities.length <= 0) {
			return Observable.of(true);
		}

		const logicalEntitiesCopy = [...logicalEntities];

		const featuresCollectionToAdd: FeatureCollection<any> = {
			type: 'FeatureCollection',
			features: []
		};

		logicalEntitiesCopy.forEach((entity: IVisualizerEntity) => {
			this.removeEntity(entity.id);
			const clonedFeatureJson: any = { ...entity.featureJson, id: entity.id };
			featuresCollectionToAdd.features.push(clonedFeatureJson);
			this.idToEntity.set(entity.id, { originalEntity: entity, feature: null });
		});

		return this.iMap.projectionService.projectCollectionApproximatelyToImage<Feature>(featuresCollectionToAdd, this.iMap)
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

	featureStyle(feature: Feature, resolution) {
		return this._iconSrc;
	}
}
