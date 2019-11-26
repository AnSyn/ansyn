import { BaseImageryVisualizer, IVisualizerEntity, VisualizerInteractionTypes } from '@ansyn/imagery';
import { Observable, of } from 'rxjs';

declare const Cesium: any;

export abstract class BaseEntitiesVisualizer extends BaseImageryVisualizer {

	billboardCollection;

	public idToEntity: Map<string, any> = new Map<string, { feature: null, originalEntity: null }>();

	onInit() {
		this.billboardCollection = this.iMap.mapObject.scene.primitives.add(new Cesium.BillboardCollection());
	}

	getIds(entity: IVisualizerEntity): string {
		if (entity.icon) {
			return `billboard_${ entity.id }`;
		}
		return entity.id;
	}

	addInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void {
	}

	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean> {
		logicalEntities.forEach((entity: IVisualizerEntity) => {
			if (entity.icon) {
				const id = this.getIds(entity);
				const billboardEntity = {
					show: true,
					position: Cesium.Cartesian3.fromDegrees(
						entity.featureJson.geometry.coordinates[0],
						entity.featureJson.geometry.coordinates[1],
						entity.featureJson.geometry.coordinates[2] ? entity.featureJson.geometry.coordinates[2] : 0
					),
					pixelOffset: Cesium.Cartesian2.ZERO,
					eyeOffset: Cesium.Cartesian3.ZERO,
					heightReference: Cesium.HeightReference.NONE,
					horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
					verticalOrigin: Cesium.VerticalOrigin.CENTER,
					scale: 1.0,
					image: entity.icon,
					imageSubRegion: undefined,
					color: Cesium.Color.WHITE,
					id: id,
					rotation: 0.0,
					alignedAxis: Cesium.Cartesian3.ZERO,
					width: undefined,
					height: undefined,
					scaleByDistance: undefined,
					translucencyByDistance: undefined,
					pixelOffsetScaleByDistance: undefined,
					sizeInMeters: false,
					distanceDisplayCondition: undefined
				};
				const feature = this.billboardCollection.add(billboardEntity);
				this.idToEntity.set(id, <any>{
					originalEntity: entity,
					feature: feature
				});
			}
		});
		return of(true);
	}

	clearEntities() {
		this.billboardCollection.removeAll();
	}

	getEntities(): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = [];
		this.idToEntity.forEach((val, key) => entities.push(val.originalEntity));
		return entities;
	}

	removeEntity(logicalEntityId: string) {
		const entity = this.getEntities().find((entity: IVisualizerEntity) => {
			const cesiumEntityId = this.getIds(entity);
			return cesiumEntityId === logicalEntityId
		});
		if (entity) {
			const cesiumEntityId = this.getIds(entity);
			const visEntity = this.idToEntity.get(cesiumEntityId);
			this.billboardCollection.remove(visEntity.feature);
			visEntity.feature = undefined;
			this.idToEntity.delete(cesiumEntityId);
		}
	}

	removeInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void {
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

	setVisibility(isVisible: boolean): void {
	}
}
