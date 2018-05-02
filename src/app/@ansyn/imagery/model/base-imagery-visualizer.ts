import { VisualizerStateStyle } from '@ansyn/plugins/openlayers/visualizers/models/visualizer-state';
import { Feature } from 'geojson';
import { Observable } from 'rxjs/Observable';
import { BaseImageryPlugin } from './base-imagery-plugin';
import { ImageryPlugin, ImageryPluginMetaData } from '@ansyn/imagery/model/base-imagery-plugin';

export interface IVisualizerEntity {
	id: string;
	featureJson: Feature<any>;
	state?: 'static' | 'activeDisplad';
	type?: string,
	style?: Partial<VisualizerStateStyle>
}

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
	 * @param {IVisualizerEntity[]} logicalEntities
	 */
	abstract setEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean>;

	/**
	 * @description ADD Or Update Entities (CRU)
	 * @param {IVisualizerEntity[]} logicalEntities
	 */
	abstract addOrUpdateEntities(logicalEntities: IVisualizerEntity[]): Observable<boolean>

	/**
	 * @description Delete Single Entity (D)
	 * @param {string} logicalEntityId
	 */
	abstract removeEntity(logicalEntityId: string);

	/**
	 * @description Delete All Entities (D)
	 */
	abstract clearEntities();

	/**
	 * @description Get All Entities
	 * @returns {IVisualizerEntity[]}
	 */
	abstract getEntities(): IVisualizerEntity[];

	/**
	 * @description This function is called for Manually hover
	 *  @param {string} id
	 */

	abstract toggleVisibility(): void;

	/**
	 * @description This function is called for adding interactions ( mapObject and interactions )
	 * @param {VisualizerInteractionTypes} type
	 * @param {any} interactionInstance
	 */

	abstract addInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void;

	/**
	 * @description This function is called for removing interactions ( mapObject and interactions )
	 * @param {VisualizerInteractionTypes} type
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
	}
}
