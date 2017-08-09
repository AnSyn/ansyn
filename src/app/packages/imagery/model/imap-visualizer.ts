/**
 * Created by AsafMas on 02/08/2017.
 */
import { IMap } from './imap';

export interface IVisualizerEntity {
	id: string;
	featureJson: GeoJSON.Feature<any>;
}

export interface IMapVisualizer {
	type: string;

	// happens after constructor
	onInit(mapId: string, map: IMap);

	// happens after Map View is set (usally needs to reproject your entities if in different projection)
	onSetView();

	///Replace all existing entities (CRUD)
	setEntities(logicalEntities: IVisualizerEntity[]);

	///ADD Or Update Entities (CRU)
	addOrUpdateEntities(logicalEntities: IVisualizerEntity[]);

	///Delete Single Entity (D)
	removeEntity(logicalEntityId: string);

	///Delete All Entities (D)
	clearEntities();

	///Get All Entities
	getEntites(): IVisualizerEntity[];

	///Dispose
	dispose();
}
