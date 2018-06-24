import { Observable } from 'rxjs';
import { BaseImageryPlugin } from './base-imagery-plugin';
import { ImageryPlugin, ImageryPluginMetaData } from './base-imagery-plugin';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';

export type VisualizerInteractionTypes = 'pointerMove' | 'doubleClick' | 'contextMenu' | 'drawInteractionHandler';

export const VisualizerInteractions: { [key: string]: VisualizerInteractionTypes } = {
	pointerMove: 'pointerMove',
	doubleClick: 'doubleClick',
	contextMenu: 'contextMenu',
	drawInteractionHandler: 'drawInteractionHandler'
};


export abstract class BaseImageryVisualizer extends BaseImageryPlugin {
	type: string;
	source: any;
	vector: any;
	isHidden: boolean;
	interactions: Map<VisualizerInteractionTypes, any>;

	/**
	 * @description Replace all existing entities (CRUD)
	 * @param logicalEntities
	 */
	abstract setEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean>;

	/**
	 * @description ADD Or Update Entities (CRU)
	 * @param logicalEntities
	 */
	abstract addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean>

	/**
	 * @description Delete Single Entity (D)
	 * @param logicalEntityId
	 */
	abstract removeEntity(logicalEntityId: string);

	/**
	 * @description Delete All Entities (D)
	 */
	abstract clearEntities();

	/**
	 * @description Get All Entities
	 */
	abstract getEntities(): IVisualizerEntity[];

	/**
	 * @description This function is called for Manually hover
	 */

	abstract toggleVisibility(): void;

	/**
	 * @description This function is called for adding interactions ( mapObject and interactions )
	 * @param type
	 * @param interactionInstance
	 */

	abstract addInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void;

	/**
	 * @description This function is called for removing interactions ( mapObject and interactions )
	 * @param type
	 * @param interactionInstance
	 */

	abstract removeInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void;
}

export interface ImageryVisualizerMetaData extends ImageryPluginMetaData {
	isHideable?: boolean;
}

export interface BaseImageryVisualizerClass extends ImageryVisualizerMetaData {
	new(...args): BaseImageryVisualizer;
}

export function ImageryVisualizer(metaData: ImageryVisualizerMetaData) {
	return function (constructor: BaseImageryVisualizerClass) {
		ImageryPlugin(metaData)(constructor);
	};
}
