import { IMap } from './imap';
import { EventEmitter } from '@angular/core';
import { Subscriber } from 'rxjs/Subscriber';
import { VisualizerStateStyle } from '@ansyn/open-layer-visualizers/models/visualizer-state';
import Vector from 'ol/layer/vector';
import { Subject } from 'rxjs/Subject';

export interface IVisualizerEntity {
	id: string;
	featureJson: GeoJSON.Feature<any>;
	state?: 'static' | 'activeDisplad';

	type?: string,
	style?: Partial<VisualizerStateStyle>
}

export type IMarkupEvent = { id: string, class: boolean }[];

export interface IMapVisualizer {
	type: string;

	source: Vector;

	onDisposedEvent: EventEmitter<any>;

	onHoverFeature: EventEmitter<any>;
	doubleClickFeature: EventEmitter<any>;


	events: Map<string, Subject<any>>;

	subscribers: Subscriber<any>[]

	/**
	 * @description This function is called after constructor and gives those args to the visualizer
	 * @param {string} mapId
	 * @param {IMap} map
	 */
	onInit(mapId: string, map: IMap<any>);

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

	setHoverFeature(id: string);
}
