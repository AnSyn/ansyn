import { Observable } from 'rxjs';
import { BaseImageryPlugin } from './base-imagery-plugin';
import { IImageryPluginMetaData } from './base-imagery-plugin';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';

export type VisualizerInteractionTypes = 'click' | 'pointerMove' | 'doubleClick' | 'contextMenu' | 'drawInteractionHandler';

export const VisualizerInteractions: { [key: string]: VisualizerInteractionTypes } = {
	click: 'click',
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

export interface IImageryVisualizerMetaData extends IImageryPluginMetaData {
	isHideable?: boolean;
}

export interface IBaseImageryVisualizerClass extends IImageryVisualizerMetaData {
	new(...args): BaseImageryVisualizer;
}
