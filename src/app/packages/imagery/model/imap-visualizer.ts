import { IMap } from './imap';
import { EventEmitter } from '@angular/core';
import { Subscriber } from 'rxjs/Subscriber';
import { VisualizerStateStyle } from '@ansyn/open-layer-visualizers/models/visualizer-state';
import { Feature } from 'geojson';

export interface IVisualizerEntity {
	id: string;
	featureJson: Feature<any>;
	state?: 'static' | 'activeDisplad';
	type?: string,
	style?: Partial<VisualizerStateStyle>
}

export type IMarkupEvent = { id: string, class: boolean }[];

export type VisualizerEventTypes =
	'onHoverFeature'
	| 'doubleClickFeature'
	| 'drawEndPublisher'
	| 'contextMenuHandler';

export const VisualizerEvents: { [key: string]: VisualizerEventTypes } = {
	onHoverFeature: 'onHoverFeature',
	doubleClickFeature: 'doubleClickFeature',
	drawEndPublisher: 'drawEndPublisher',
	contextMenuHandler: 'contextMenuHandler'
};

export type VisualizerInteractionTypes = 'pointerMove' | 'doubleClick' | 'contextMenu' | 'drawInteractionHandler';

export const VisualizerInteractions: { [key: string]: VisualizerInteractionTypes } = {
	pointerMove: 'pointerMove',
	doubleClick: 'doubleClick',
	contextMenu: 'contextMenu',
	drawInteractionHandler: 'drawInteractionHandler'
};




export interface IMapVisualizer {
	type: string;
	source: any;
	vector: any;
	isHideable: boolean;
	isHidden: boolean;
	onDisposedEvent: EventEmitter<any>;
	events: Map<VisualizerEventTypes, EventEmitter<any>>;
	interactions: Map<VisualizerInteractionTypes, any>;
	subscribers: Subscriber<any>[];

	/**
	 * @description This function is called after constructor and gives those args to the visualizer
	 * @param {string} mapId
	 * @param {IMap} map
	 */
	onInit(mapId: string, map: IMap);

	/**
	 * @description This function is called after map resetView() is called. use this method to:
	 * 1. re-add the layer
	 * 2. reproject your entities
	 */
	onResetView();

	/**
	 * @description Replace all existing entities (CRUD)
	 * @param {IVisualizerEntity[]} logicalEntities
	 */
	setEntities(logicalEntities: IVisualizerEntity[]);

	/**
	 * @description ADD Or Update Entities (CRU)
	 * @param {IVisualizerEntity[]} logicalEntities
	 */
	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]);

	/**
	 * @description Delete Single Entity (D)
	 * @param {string} logicalEntityId
	 */
	removeEntity(logicalEntityId: string);

	/**
	 * @description Delete All Entities (D)
	 */
	clearEntities();

	/**
	 * @description Get All Entities
	 * @returns {IVisualizerEntity[]}
	 */
	getEntities(): IVisualizerEntity[];

	/**
	 * @description This function is called before the map is destroyed
	 */

	dispose();

	/**
	 * @description This function is called for Manually hover
	 *  @param {string} id
	 */

	toggleVisibility(): void;

	/**
	 * @description This function is called for adding interactions ( mapObject and interactions )
	 * @param {VisualizerInteractionTypes} type
	 * @param {any} interactionInstance
	 */

	addInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void;

	/**
	 * @description This function is called for removing interactions ( mapObject and interactions )
	 * @param {VisualizerInteractionTypes} type
	 */

	removeInteraction(type: VisualizerInteractionTypes, interactionInstance: any): void;


	addEvent(type: VisualizerEventTypes): void;

	removeEvent(type: VisualizerEventTypes): void;
}
