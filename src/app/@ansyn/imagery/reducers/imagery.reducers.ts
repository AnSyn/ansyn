import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { ImageryActionType } from '../actions/imagery.actions';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { createSelector } from '@ngrx/store';
import { ICaseMapState } from '@ansyn/core';

export interface ImageryEntity {
	id: string;
	virtualNorth: number;
	settings: ICaseMapState;
	activeMap: string;
}

export const initImageryEntity = (settings: ICaseMapState): ImageryEntity => ({
	id: settings.id,
	virtualNorth: 0,
	settings,
	activeMap: null
});

export type ImageryState = EntityState<ImageryEntity>;

export const imageryFeatureKey = 'imagery';

export const imageryStateSelector: MemoizedSelector<any, ImageryState> = createFeatureSelector<ImageryState>(imageryFeatureKey);

const imageryAdapter = createEntityAdapter<ImageryEntity>();

const imageryInitialState = imageryAdapter.getInitialState();

export function ImageryReducer(state: ImageryState = imageryInitialState, action: any ): ImageryState {
	switch (action.type) {
		case ImageryActionType.addAll:
			return imageryAdapter.addAll(action.payload, state);

		case ImageryActionType.createImagery:
			return imageryAdapter.addOne(initImageryEntity(action.payload.settings), state);

		case ImageryActionType.removeImagery:
			return imageryAdapter.removeOne(action.payload.id, state);

		case ImageryActionType.changeImageryMap: {
			const { id, mapType } = action.payload;
			return imageryAdapter.updateOne({ id, changes: { activeMap: mapType } }, state);
		}

		case ImageryActionType.setVirtualNorth: {
			const { id, virtualNorth } = action.payload;
			return imageryAdapter.updateOne({ id, changes: { virtualNorth } }, state);
		}

		default:
			return state;
	}
}
const { selectAll, selectEntities } = imageryAdapter.getSelectors();

export const selectCommunicators = createSelector(imageryStateSelector, selectEntities);
export const selectCommunicatorsList = createSelector(imageryStateSelector, selectAll);
export const selectCommunicator = (id) => createSelector(selectEntities, (entities) => entities[id]);
export const selectVirtualNorth = (id) => {

	return createSelector(selectCommunicator(id), (entity => entity.virtualNorth));
}
export const selectActiveMap = (id) => createSelector(selectCommunicator(id), (entity => entity.activeMap));
