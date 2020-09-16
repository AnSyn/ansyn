import { Observable } from 'rxjs';
import { BaseImageryPlugin, IImageryPluginMetaData } from './base-imagery-plugin';
import { IVisualizerEntity } from './visualizers/visualizers-entity';

export type VisualizerInteractionTypes =
	'click'
	| 'pointerMove'
	| 'doubleClick'
	| 'contextMenu'
	| 'drawInteractionHandler'
	| 'translateInteractionHandler'
	| 'labelTranslateHandler'
	| 'editAnnotationTranslateHandler'
	| 'modifyInteractionHandler'
	| 'selectMeasureLabelHandler';

export const VisualizerInteractions: { [key: string]: VisualizerInteractionTypes } = {
	click: 'click',
	pointerMove: 'pointerMove',
	doubleClick: 'doubleClick',
	contextMenu: 'contextMenu',
	drawInteractionHandler: 'drawInteractionHandler',
	selectMeasureLabelHandler: 'selectMeasureLabelHandler',
	translateInteractionHandler: 'translateInteractionHandler', // for pixel offset translate and measure label translate
	labelTranslateHandler: 'labelTranslateHandler',
	editAnnotationTranslateHandler: 'editAnnotationTranslateHandler', // for actual geometry change
	modifyInteractionHandler: 'modifyInteractionHandler'
};

export interface IImageryVisualizerMetaData extends IImageryPluginMetaData {
	readonly isHideable?: boolean;
	readonly dontRestrictToExtent?: boolean;
	readonly layerClassName?: string;
}

export abstract class BaseImageryVisualizer extends BaseImageryPlugin implements IImageryVisualizerMetaData {
	readonly isHideable?: boolean;
	readonly dontRestrictToExtent?: boolean;
	readonly layerClassName?: string;
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

	abstract setVisibility(isVisible: boolean): void;

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

export interface IBaseImageryVisualizerClass {
	new(...args): BaseImageryVisualizer;
}
